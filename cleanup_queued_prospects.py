#!/usr/bin/env python3
"""Batch cleanup for queued BlueJays prospects.

This script fetches queued prospects joined with generated site data from Supabase,
repairs image-related problems inside site_data, flags generic default services/about
copy, optionally repairs obviously incomplete addresses from the prospect record,
and writes the updated site_data back to generated_sites.

The script is designed to be idempotent. Re-running it should produce no further
changes once a prospect has already been cleaned.
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import os
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import requests

REPO_ROOT = Path(__file__).resolve().parent
GENERATOR_TS = REPO_ROOT / "src/lib/generator.ts"
IMAGE_VALIDATOR_TS = REPO_ROOT / "src/lib/image-validator.ts"
TEMPLATES_DIR = REPO_ROOT / "src/components/templates"
DEFAULT_BATCH_SIZE = 10
DEFAULT_PAGE_SIZE = 100
DEFAULT_TIMEOUT = 12
DEFAULT_SLEEP_SECONDS = 0.4
GENERIC_ABOUT_FRAGMENTS = (
    "trusted name in local",
    "committed to delivering exceptional",
)
CATEGORY_ALIASES = {
    "legal": "law-firm",
    "law": "law-firm",
    "plumbing": "plumber",
    "general-contractor": "general-contractor",
    "pressure-washing": "pressure-washing",
    "physical-therapy": "physical-therapy",
    "auto-repair": "auto-repair",
    "interior-design": "interior-design",
    "pest-control": "pest-control",
    "real-estate": "real-estate",
}
SPECIAL_FILENAME_CATEGORY = {
    "V2HvacPreview.tsx": "hvac",
    "V2LawFirmPreview.tsx": "law-firm",
    "V2PlumberPreview.tsx": "plumber",
}
URL_CONTROL_CHARS_RE = re.compile(r"[\u0000-\u001F\u007F]+")
TRAILING_URL_GARBAGE_RE = re.compile(r"(?i)(?:%0a|%0d)+$")
ENCODED_NEWLINE_RE = re.compile(r"(?i)%0a|%0d")
DIMENSION_PATTERNS = [
    re.compile(r"[?&](?:w|width)=(\d{1,4})(?:[&#]|$)", re.I),
    re.compile(r"[?&](?:h|height)=(\d{1,4})(?:[&#]|$)", re.I),
    re.compile(r"(?:^|[,_/-])w[_-]?(\d{1,4})(?:[,_/-]|$)", re.I),
    re.compile(r"(?:^|[,_/-])h[_-]?(\d{1,4})(?:[,_/-]|$)", re.I),
    re.compile(r"(?:^|[,_/-])(\d{1,4})x(\d{1,4})(?:[,_/-]|$)", re.I),
    re.compile(r"=w(\d{1,4})-h(\d{1,4})", re.I),
]
LOGO_PATTERNS = [re.compile(p, re.I) for p in (r"logo", r"favicon", r"icon")]
IMAGE_CONTENT_TYPES = ("image/", "application/octet-stream")
SERVICE_PAIR_RE = re.compile(
    r"\{\s*name:\s*\"([^\"]+)\",\s*description:\s*\"([^\"]+)\"(?:,\s*price:\s*\"[^\"]+\")?[^}]*\}",
    re.S,
)
STRING_LITERAL_RE = re.compile(r'"([^\"]+)"')


class SupabaseError(RuntimeError):
    pass


@dataclass
class UrlCheck:
    url: str
    reachable: bool
    status_code: int
    content_type: str
    error: str = ""


@dataclass
class CandidatePhoto:
    url: str
    slot_hint: str
    reachable: bool
    content_type: str
    width_hints: List[int]
    looks_like_logo: bool
    looks_too_small: bool
    reject_reason: str = ""


class SupabaseRestClient:
    def __init__(self, base_url: str, service_role_key: str, timeout: int = DEFAULT_TIMEOUT) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(
            {
                "apikey": service_role_key,
                "Authorization": f"Bearer {service_role_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        )

    def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Any:
        response = self.session.get(f"{self.base_url}{path}", params=params, timeout=self.timeout)
        if response.status_code >= 400:
            raise SupabaseError(f"GET {path} failed with {response.status_code}: {response.text}")
        return response.json()

    def patch(self, path: str, payload: Dict[str, Any], params: Optional[Dict[str, Any]] = None) -> Any:
        headers = {"Prefer": "return=representation"}
        response = self.session.patch(
            f"{self.base_url}{path}",
            params=params,
            data=json.dumps(payload),
            headers=headers,
            timeout=self.timeout,
        )
        if response.status_code >= 400:
            raise SupabaseError(f"PATCH {path} failed with {response.status_code}: {response.text}")
        if not response.text:
            return None
        return response.json()


class HeadValidator:
    def __init__(self, timeout: int = DEFAULT_TIMEOUT) -> None:
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "BlueJaysCleanup/1.0 (+https://bluejayportfolio.com)",
                "Accept": "image/*,*/*;q=0.8",
            }
        )
        self.cache: Dict[str, UrlCheck] = {}

    def head(self, url: str) -> UrlCheck:
        if url in self.cache:
            return self.cache[url]
        try:
            response = self.session.head(url, allow_redirects=True, timeout=self.timeout)
            content_type = (response.headers.get("content-type") or "").lower()
            reachable = 200 <= response.status_code < 400 and (
                not content_type or content_type.startswith(IMAGE_CONTENT_TYPES)
            )
            result = UrlCheck(
                url=url,
                reachable=reachable,
                status_code=response.status_code,
                content_type=content_type,
                error="" if reachable else f"HTTP {response.status_code} {content_type}".strip(),
            )
        except requests.RequestException as exc:
            result = UrlCheck(url=url, reachable=False, status_code=0, content_type="", error=str(exc))
        self.cache[url] = result
        return result


def normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def normalize_category(category: Optional[str]) -> str:
    key = normalize_whitespace(category or "").lower()
    return CATEGORY_ALIASES.get(key, key)


def sanitize_image_url(url: Optional[str]) -> str:
    if not url:
        return ""
    cleaned = URL_CONTROL_CHARS_RE.sub("", str(url)).strip()
    cleaned = ENCODED_NEWLINE_RE.sub("", cleaned)
    cleaned = TRAILING_URL_GARBAGE_RE.sub("", cleaned).strip()
    return cleaned


def canonicalize_url_for_dedupe(url: str) -> str:
    sanitized = sanitize_image_url(url)
    if not sanitized:
        return ""
    try:
        parts = urlsplit(sanitized)
    except ValueError:
        return sanitized
    query_pairs = sorted(parse_qsl(parts.query, keep_blank_values=True))
    canonical_query = urlencode(query_pairs, doseq=True)
    canonical_path = parts.path.rstrip("/") or "/"
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), canonical_path, canonical_query, ""))


def dedupe_urls(urls: Sequence[str]) -> Tuple[List[str], int]:
    seen: set[str] = set()
    result: List[str] = []
    removed = 0
    for url in urls:
        key = canonicalize_url_for_dedupe(url)
        if not key or key in seen:
            removed += 1
            continue
        seen.add(key)
        result.append(url)
    return result, removed


def extract_dimension_hints(url: str) -> List[int]:
    hints: List[int] = []
    for pattern in DIMENSION_PATTERNS:
        match = pattern.search(url)
        if not match:
            continue
        for value in match.groups():
            if not value:
                continue
            try:
                parsed = int(value)
            except ValueError:
                continue
            hints.append(parsed)
    return hints


def url_looks_like_logo(url: str, content_type: str = "") -> bool:
    lowered = url.lower()
    if any(pattern.search(lowered) for pattern in LOGO_PATTERNS):
        return True
    if lowered.endswith(".svg") or "image/svg+xml" in (content_type or ""):
        return True
    hints = extract_dimension_hints(lowered)
    return bool(hints) and max(hints) < 200


def slot_min_width(slot: str) -> int:
    if slot == "hero":
        return 800
    return 400


def url_too_small_for_slot(url: str, slot: str) -> bool:
    hints = extract_dimension_hints(url)
    if not hints:
        return False
    return max(hints) < slot_min_width(slot)


def sanitize_and_dedupe_photo_urls(urls: Sequence[Any]) -> Tuple[List[str], Dict[str, int]]:
    original = [str(url) for url in (urls or []) if url is not None]
    sanitized = [sanitize_image_url(url) for url in original]
    sanitized = [url for url in sanitized if url]
    sanitized_count = sum(1 for before, after in zip(original, [sanitize_image_url(u) for u in original]) if before != after)
    deduped, duplicates_removed = dedupe_urls(sanitized)
    return deduped, {
        "original_count": len(original),
        "sanitized_count": sanitized_count,
        "duplicates_removed": duplicates_removed,
    }


def choose_candidate(
    candidates: Sequence[CandidatePhoto],
    slot: str,
    used: set[str],
) -> Optional[CandidatePhoto]:
    for candidate in candidates:
        if candidate.url in used:
            continue
        if not candidate.reachable:
            continue
        if candidate.looks_like_logo:
            continue
        if url_too_small_for_slot(candidate.url, slot):
            continue
        return candidate
    return None


def convert_unsplash_width(url: str, width: int) -> str:
    if "images.unsplash.com/" not in url:
        return url
    parts = urlsplit(url)
    pairs = parse_qsl(parts.query, keep_blank_values=True)
    filtered = [(k, v) for k, v in pairs if k.lower() not in {"w", "width", "h", "height"}]
    filtered.append(("w", str(width)))
    filtered.append(("q", "80"))
    query = urlencode(filtered, doseq=True)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, query, parts.fragment))


def camel_to_kebab(value: str) -> str:
    result = re.sub(r"(.)([A-Z][a-z]+)", r"\1-\2", value)
    result = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", result)
    return result.lower()


def derive_category_from_template_name(path: Path) -> str:
    if path.name in SPECIAL_FILENAME_CATEGORY:
        return SPECIAL_FILENAME_CATEGORY[path.name]
    raw = path.stem.replace("V2", "").replace("Preview", "")
    return camel_to_kebab(raw)


def parse_template_stock_mapping(templates_dir: Path) -> Dict[str, Dict[str, List[str] | str]]:
    mapping: Dict[str, Dict[str, List[str] | str]] = {}
    for path in sorted(templates_dir.glob("V2*Preview.tsx")):
        text = path.read_text(encoding="utf-8")
        hero_match = re.search(r'const STOCK_HERO = "([^"]+)";', text)
        about_match = re.search(r'const STOCK_ABOUT = "([^"]+)";', text)
        gallery_match = re.search(r"const STOCK_GALLERY = \[(.*?)\];", text, re.S)
        if not hero_match or not about_match or not gallery_match:
            continue
        gallery_urls = STRING_LITERAL_RE.findall(gallery_match.group(1))
        gallery_urls = [sanitize_image_url(url) for url in gallery_urls if url]
        gallery_urls, _ = dedupe_urls(gallery_urls)
        category = derive_category_from_template_name(path)
        extra_candidates: List[str] = []
        extra_candidates.extend(gallery_urls)
        extra_candidates.append(convert_unsplash_width(hero_match.group(1), 800))
        extra_candidates.append(convert_unsplash_width(about_match.group(1), 800))
        extra_candidates, _ = dedupe_urls(extra_candidates)
        mapping[category] = {
            "hero": sanitize_image_url(hero_match.group(1)),
            "about": sanitize_image_url(about_match.group(1)),
            "gallery": extra_candidates[:4],
        }
    return mapping


def build_unsplash_url(photo_id: str, width: int, height: int) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={width}&h={height}&q=80"


def parse_image_validator_stock_mapping(image_validator_path: Path) -> Dict[str, Dict[str, List[str] | str]]:
    text = image_validator_path.read_text(encoding="utf-8")
    match = re.search(r"const CATEGORY_FALLBACK_IDS: Record<Category, Record<FallbackImageVariant, string>> = \{(.*?)\};", text, re.S)
    if not match:
        return {}
    body = match.group(1)
    category_blocks = re.finditer(r'([\w-]+|"[^"]+"):\s*\{(.*?)\}', body, re.S)
    mapping: Dict[str, Dict[str, List[str] | str]] = {}
    for block in category_blocks:
        category = block.group(1).strip('"')
        block_body = block.group(2)
        ids: Dict[str, str] = {}
        for variant, photo_id in re.findall(r'(hero|about|gallery):\s*"([^"]+)"', block_body):
            ids[variant] = photo_id
        if {"hero", "about", "gallery"}.issubset(ids):
            gallery = [
                build_unsplash_url(ids["gallery"], 1200, 800),
                build_unsplash_url(ids["gallery"], 1000, 700),
                build_unsplash_url(ids["about"], 900, 650),
                build_unsplash_url(ids["hero"], 800, 600),
            ]
            gallery, _ = dedupe_urls(gallery)
            mapping[category] = {
                "hero": build_unsplash_url(ids["hero"], 1600, 900),
                "about": build_unsplash_url(ids["about"], 1200, 900),
                "gallery": gallery[:4],
            }
    return mapping


def merge_stock_mappings(
    primary: Dict[str, Dict[str, List[str] | str]],
    secondary: Dict[str, Dict[str, List[str] | str]],
) -> Dict[str, Dict[str, List[str] | str]]:
    merged = dict(secondary)
    merged.update(primary)
    for category, stock in list(merged.items()):
        gallery = list(stock.get("gallery", []))
        extras = [str(stock.get("about", "")), str(stock.get("hero", ""))]
        extras = [convert_unsplash_width(url, 800) for url in extras if url]
        gallery.extend(extras)
        gallery, _ = dedupe_urls([url for url in gallery if url])
        merged[category] = {
            "hero": stock.get("hero", ""),
            "about": stock.get("about", ""),
            "gallery": gallery[:4],
        }
    return merged


def parse_default_services(generator_path: Path) -> Tuple[Dict[str, List[Dict[str, str]]], List[Dict[str, str]]]:
    text = generator_path.read_text(encoding="utf-8")
    start = text.index("const defaults: Partial<Record<Category")
    end = text.index("  const label = CATEGORY_CONFIG[category]?.label", start)
    block = text[start:end]
    category_pattern = re.compile(r'([\w-]+|"[^"]+"):\s*\[(.*?)\],', re.S)
    defaults: Dict[str, List[Dict[str, str]]] = {}
    for category_token, body in category_pattern.findall(block):
        category = category_token.strip('"')
        services = [
            {"name": name, "description": description}
            for name, description in SERVICE_PAIR_RE.findall(body)
        ]
        if services:
            defaults[category] = services
    fallback_start = text.index("return defaults[category] || [", end)
    fallback_end = text.index("];\n}\n\nfunction getDefaultTestimonials", fallback_start)
    fallback_block = text[fallback_start:fallback_end]
    fallback_services = [
        {"name": name, "description": description}
        for name, description in SERVICE_PAIR_RE.findall(fallback_block)
    ]
    return defaults, fallback_services


def parse_default_about_templates(generator_path: Path) -> Dict[str, str]:
    text = generator_path.read_text(encoding="utf-8")
    about_match = re.search(r"const aboutTexts: Partial<Record<Category, string>> = \{(.*?)\};", text, re.S)
    defaults: Dict[str, str] = {}
    if about_match:
        body = about_match.group(1)
        entry_pattern = re.compile(r'([\w-]+|"[^"]+"):\s*`([^`]+)`', re.S)
        for category_token, template in entry_pattern.findall(body):
            defaults[category_token.strip('"')] = normalize_whitespace(template)
    return defaults


def normalize_service_name(name: str) -> str:
    return normalize_whitespace(name).lower()


def normalize_service_pair(service: Dict[str, Any]) -> Tuple[str, str]:
    return (
        normalize_service_name(service.get("name", "")),
        normalize_whitespace(service.get("description", "")).lower(),
    )


def looks_like_default_services(
    services: Sequence[Dict[str, Any]],
    category: str,
    default_services: Dict[str, List[Dict[str, str]]],
    fallback_services: List[Dict[str, str]],
) -> bool:
    current = [normalize_service_pair(service) for service in services if service.get("name")]
    if not current:
        return False
    category = normalize_category(category)
    expected_pairs = [normalize_service_pair(service) for service in default_services.get(category, fallback_services)]
    expected_names = [name for name, _ in expected_pairs]
    current_names = [name for name, _ in current]
    if current_names == expected_names[: len(current_names)] and len(current_names) == len(expected_names):
        return True
    return len(current) == len(expected_pairs) and set(current) == set(expected_pairs)


def looks_like_generic_about(about: str, business_name: str, category: str, default_abouts: Dict[str, str]) -> bool:
    about_normalized = normalize_whitespace(about).lower()
    if not about_normalized:
        return False
    if all(fragment in about_normalized for fragment in GENERIC_ABOUT_FRAGMENTS):
        return True
    category = normalize_category(category)
    template = default_abouts.get(category)
    if not template:
        return False
    normalized_template = normalize_whitespace(template.replace("${businessName}", "<business>"))
    normalized_current = normalize_whitespace(about)
    if business_name:
        normalized_current = normalized_current.replace(business_name, "<business>")
    return normalized_current.lower() == normalized_template.lower()


def address_is_incomplete(address: str) -> bool:
    normalized = normalize_whitespace(address)
    if not normalized or len(normalized) < 8:
        return True
    has_digit = any(char.isdigit() for char in normalized)
    has_separator = "," in normalized
    return not has_digit or not has_separator


def build_prospect_address(prospect: Dict[str, Any]) -> str:
    parts = [
        normalize_whitespace(str(prospect.get("address") or "")),
        normalize_whitespace(str(prospect.get("city") or "")),
        normalize_whitespace(str(prospect.get("state") or "")),
    ]
    parts = [part for part in parts if part]
    return ", ".join(parts)


def read_audit_ids(audit_path: Path) -> List[str]:
    ids: List[str] = []
    if audit_path.suffix.lower() == ".csv":
        with audit_path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                prospect_id = row.get("prospect_id") or row.get("id")
                if prospect_id:
                    ids.append(str(prospect_id).strip())
    elif audit_path.suffix.lower() == ".json":
        data = json.loads(audit_path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            for row in data:
                if isinstance(row, dict) and row.get("prospect_id"):
                    ids.append(str(row["prospect_id"]).strip())
    seen: set[str] = set()
    deduped: List[str] = []
    for prospect_id in ids:
        if not prospect_id or prospect_id in seen:
            continue
        seen.add(prospect_id)
        deduped.append(prospect_id)
    return deduped


def chunked(items: Sequence[Any], size: int) -> Iterable[Sequence[Any]]:
    for index in range(0, len(items), size):
        yield items[index : index + size]


def fetch_generated_sites_for_ids(client: SupabaseRestClient, prospect_ids: Sequence[str]) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for batch in chunked(list(prospect_ids), 100):
        joined_ids = ",".join(batch)
        params = {
            "select": "id,prospect_id,site_data,prospects!inner(id,business_name,category,phone,address,city,state,status)",
            "prospect_id": f"in.({joined_ids})",
            "order": "prospect_id.asc",
        }
        rows.extend(client.get("/generated_sites", params=params))
    return rows


def fetch_generated_sites_for_queue_statuses(
    client: SupabaseRestClient,
    statuses: Sequence[str],
    page_size: int = DEFAULT_PAGE_SIZE,
) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    offset = 0
    status_filter = f"in.({','.join(statuses)})"
    while True:
        params = {
            "select": "id,prospect_id,site_data,prospects!inner(id,business_name,category,phone,address,city,state,status)",
            "prospects.status": status_filter,
            "order": "prospect_id.asc",
            "limit": page_size,
            "offset": offset,
        }
        page = client.get("/generated_sites", params=params)
        if not page:
            break
        rows.extend(page)
        offset += page_size
    return rows


def build_candidate_photos(urls: Sequence[str], validator: HeadValidator) -> Tuple[List[CandidatePhoto], int]:
    candidates: List[CandidatePhoto] = []
    broken_removed = 0
    for index, url in enumerate(urls):
        slot_hint = "hero" if index == 0 else "about" if index == 1 else "gallery"
        check = validator.head(url)
        if not check.reachable:
            broken_removed += 1
            continue
        looks_logo = url_looks_like_logo(url, check.content_type)
        too_small = url_too_small_for_slot(url, slot_hint)
        reason = []
        if looks_logo:
            reason.append("logo_or_icon")
        if too_small:
            reason.append("too_small")
        candidates.append(
            CandidatePhoto(
                url=url,
                slot_hint=slot_hint,
                reachable=check.reachable,
                content_type=check.content_type,
                width_hints=extract_dimension_hints(url),
                looks_like_logo=looks_logo,
                looks_too_small=too_small,
                reject_reason=",".join(reason),
            )
        )
    return candidates, broken_removed


def ensure_category_stock_mapping(
    stock_mapping: Dict[str, Dict[str, List[str] | str]],
    required_categories: Sequence[str],
) -> None:
    missing: List[str] = []
    incomplete: List[str] = []
    for category in required_categories:
        normalized = normalize_category(category)
        stock = stock_mapping.get(normalized)
        if not stock:
            missing.append(category)
            continue
        gallery = list(stock.get("gallery", []))
        if not stock.get("hero") or not stock.get("about") or len(gallery) < 4:
            incomplete.append(category)
    if missing or incomplete:
        problems = []
        if missing:
            problems.append(f"missing mappings for: {', '.join(sorted(missing))}")
        if incomplete:
            problems.append(f"incomplete mappings for: {', '.join(sorted(incomplete))}")
        raise RuntimeError("Stock image mapping is incomplete; " + "; ".join(problems))


def process_site_data(
    row: Dict[str, Any],
    stock_mapping: Dict[str, Dict[str, List[str] | str]],
    default_services: Dict[str, List[Dict[str, str]]],
    fallback_services: List[Dict[str, str]],
    default_abouts: Dict[str, str],
    validator: HeadValidator,
    repair_address: bool = True,
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    prospect = row.get("prospects") or {}
    site_data = dict(row.get("site_data") or {})
    category = normalize_category(site_data.get("category") or prospect.get("category") or "")
    business_name = site_data.get("businessName") or prospect.get("business_name") or ""
    stock = stock_mapping[category]

    original_photos = list(site_data.get("photos") or [])
    sanitized_photos, counts = sanitize_and_dedupe_photo_urls(original_photos)
    candidates, broken_removed = build_candidate_photos(sanitized_photos, validator)

    used: set[str] = set()
    hero_candidate = choose_candidate(candidates, "hero", used)
    hero_replaced = False
    if hero_candidate:
        hero_url = hero_candidate.url
        used.add(hero_url)
        original_hero = sanitized_photos[0] if sanitized_photos else ""
        hero_replaced = original_hero != hero_url
    else:
        hero_url = str(stock["hero"])
        used.add(hero_url)
        hero_replaced = True

    about_candidate = choose_candidate(candidates, "about", used)
    about_replaced = False
    if about_candidate:
        about_url = about_candidate.url
        used.add(about_url)
        original_about = sanitized_photos[1] if len(sanitized_photos) > 1 else ""
        about_replaced = original_about != about_url
    else:
        about_url = str(stock["about"])
        used.add(about_url)
        about_replaced = True

    gallery_candidates: List[str] = []
    for candidate in candidates:
        if candidate.url in used:
            continue
        if candidate.looks_like_logo or url_too_small_for_slot(candidate.url, "gallery"):
            continue
        gallery_candidates.append(candidate.url)
        used.add(candidate.url)

    gallery_supplemented = 0
    for fallback in list(stock["gallery"]):
        if len(gallery_candidates) >= 4:
            break
        if fallback in used:
            continue
        gallery_candidates.append(str(fallback))
        used.add(str(fallback))
        gallery_supplemented += 1

    new_photos = [hero_url, about_url, *gallery_candidates]
    new_photos, _ = dedupe_urls(new_photos)

    site_data["category"] = category
    site_data["businessName"] = business_name or site_data.get("businessName")
    site_data["photos"] = new_photos

    address_fixed = False
    if repair_address:
        current_address = site_data.get("address") or ""
        fallback_address = build_prospect_address(prospect)
        if fallback_address and address_is_incomplete(current_address):
            site_data["address"] = fallback_address
            address_fixed = normalize_whitespace(current_address) != normalize_whitespace(fallback_address)

    services = site_data.get("services") or []
    about = site_data.get("about") or ""
    default_services_flag = looks_like_default_services(services, category, default_services, fallback_services)
    generic_about_flag = looks_like_generic_about(about, business_name, category, default_abouts)

    fixes: List[str] = []
    if counts["sanitized_count"]:
        fixes.append(f"sanitized_urls:{counts['sanitized_count']}")
    if counts["duplicates_removed"]:
        fixes.append(f"duplicates_removed:{counts['duplicates_removed']}")
    if broken_removed:
        fixes.append(f"broken_urls_removed:{broken_removed}")
    if hero_replaced:
        fixes.append("hero_replaced")
    if about_replaced:
        fixes.append("about_replaced")
    if gallery_supplemented:
        fixes.append(f"gallery_supplemented:{gallery_supplemented}")
    if address_fixed:
        fixes.append("address_fixed")

    flags: List[str] = []
    if default_services_flag:
        flags.append("default_services")
    if generic_about_flag:
        flags.append("generic_about")

    changed = json.dumps(row.get("site_data") or {}, sort_keys=True) != json.dumps(site_data, sort_keys=True)
    metadata = {
        "prospect_id": row.get("prospect_id"),
        "business_name": prospect.get("business_name") or business_name,
        "category": category,
        "generated_site_id": row.get("id"),
        "before_photo_count": len(original_photos),
        "after_photo_count": len(new_photos),
        "urls_sanitized": counts["sanitized_count"],
        "duplicates_removed": counts["duplicates_removed"],
        "broken_urls_removed": broken_removed,
        "hero_replaced": hero_replaced,
        "about_replaced": about_replaced,
        "gallery_supplemented": gallery_supplemented,
        "address_fixed": address_fixed,
        "default_services_flag": default_services_flag,
        "generic_about_flag": generic_about_flag,
        "fixes": ";".join(fixes),
        "flags": ";".join(flags),
        "updated": changed,
    }
    return site_data, metadata


def write_report(rows: Sequence[Dict[str, Any]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "prospect_id",
        "generated_site_id",
        "business_name",
        "category",
        "fixes",
        "flags",
        "before_photo_count",
        "after_photo_count",
        "urls_sanitized",
        "duplicates_removed",
        "broken_urls_removed",
        "hero_replaced",
        "about_replaced",
        "gallery_supplemented",
        "address_fixed",
        "default_services_flag",
        "generic_about_flag",
        "updated",
    ]
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({name: row.get(name, "") for name in fieldnames})


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Clean queued BlueJays generated_sites records in Supabase.")
    parser.add_argument("--supabase-url", default=os.getenv("SUPABASE_URL"), help="Supabase project URL.")
    parser.add_argument(
        "--supabase-service-role-key",
        default=os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        help="Supabase service role key.",
    )
    parser.add_argument(
        "--audit-file",
        type=Path,
        default=None,
        help="Optional CSV or JSON audit file containing prospect_id rows to target exactly.",
    )
    parser.add_argument(
        "--queue-statuses",
        default="queued,ready_to_review",
        help="Comma-separated prospect statuses to treat as queued when no audit file is supplied.",
    )
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    parser.add_argument("--report", type=Path, default=REPO_ROOT / "reports/queued_prospect_cleanup_report.csv")
    parser.add_argument("--sleep-seconds", type=float, default=DEFAULT_SLEEP_SECONDS)
    parser.add_argument("--head-timeout", type=int, default=DEFAULT_TIMEOUT, help="Per-URL HEAD validation timeout in seconds.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-address-repair", action="store_true")
    parser.add_argument("--verbose", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    if not args.supabase_url or not args.supabase_service_role_key:
        logging.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")
        return 2

    client = SupabaseRestClient(
        base_url=f"{args.supabase_url.rstrip('/')}/rest/v1",
        service_role_key=args.supabase_service_role_key,
    )
    validator = HeadValidator(timeout=args.head_timeout)
    template_stock_mapping = parse_template_stock_mapping(TEMPLATES_DIR)
    validator_stock_mapping = parse_image_validator_stock_mapping(IMAGE_VALIDATOR_TS)
    stock_mapping = merge_stock_mappings(template_stock_mapping, validator_stock_mapping)
    default_services, fallback_services = parse_default_services(GENERATOR_TS)
    default_abouts = parse_default_about_templates(GENERATOR_TS)
    logging.info(
        "Loaded stock mappings for %s categories (%s from templates, %s from validator fallbacks)",
        len(stock_mapping),
        len(template_stock_mapping),
        len(validator_stock_mapping),
    )

    required_categories = [
        "dental",
        "accounting",
        "auto-repair",
        "chiropractic",
        "cleaning",
        "electrician",
        "general-contractor",
        "hvac",
        "insurance",
        "interior-design",
        "landscaping",
        "legal",
        "locksmith",
        "painting",
        "pest-control",
        "physical-therapy",
        "plumbing",
        "pressure-washing",
        "real-estate",
        "roofing",
        "salon",
        "veterinary",
    ]
    ensure_category_stock_mapping(stock_mapping, required_categories)

    if args.audit_file:
        prospect_ids = read_audit_ids(args.audit_file)
        logging.info("Loaded %s prospect IDs from %s", len(prospect_ids), args.audit_file)
        rows = fetch_generated_sites_for_ids(client, prospect_ids)
    else:
        statuses = [normalize_whitespace(value) for value in args.queue_statuses.split(",") if normalize_whitespace(value)]
        logging.info("Fetching generated sites for queue statuses: %s", ", ".join(statuses))
        rows = fetch_generated_sites_for_queue_statuses(client, statuses)

    if not rows:
        logging.warning("No queued generated_sites rows were returned.")
        write_report([], args.report)
        return 0

    logging.info("Fetched %s generated_sites rows for cleanup", len(rows))

    report_rows: List[Dict[str, Any]] = []
    processed = 0
    updated_count = 0

    for batch_number, batch in enumerate(chunked(rows, args.batch_size), start=1):
        logging.info("Processing batch %s with %s prospects", batch_number, len(batch))
        for row in batch:
            processed += 1
            try:
                site_data, metadata = process_site_data(
                    row=row,
                    stock_mapping=stock_mapping,
                    default_services=default_services,
                    fallback_services=fallback_services,
                    default_abouts=default_abouts,
                    validator=validator,
                    repair_address=not args.no_address_repair,
                )
                if metadata["updated"] and not args.dry_run:
                    client.patch(
                        "/generated_sites",
                        payload={"site_data": site_data},
                        params={"id": f"eq.{row['id']}"},
                    )
                    updated_count += 1
                elif metadata["updated"]:
                    updated_count += 1
                report_rows.append(metadata)
                logging.info(
                    "[%s/%s] prospect_id=%s business=%s updated=%s fixes=%s flags=%s",
                    processed,
                    len(rows),
                    metadata["prospect_id"],
                    metadata["business_name"],
                    metadata["updated"],
                    metadata["fixes"] or "none",
                    metadata["flags"] or "none",
                )
            except Exception as exc:  # noqa: BLE001
                logging.exception("Failed processing generated_site id=%s prospect_id=%s", row.get("id"), row.get("prospect_id"))
                report_rows.append(
                    {
                        "prospect_id": row.get("prospect_id"),
                        "generated_site_id": row.get("id"),
                        "business_name": (row.get("prospects") or {}).get("business_name", ""),
                        "category": normalize_category((row.get("prospects") or {}).get("category", "")),
                        "fixes": "",
                        "flags": f"error:{exc}",
                        "before_photo_count": len((row.get("site_data") or {}).get("photos") or []),
                        "after_photo_count": "",
                        "urls_sanitized": "",
                        "duplicates_removed": "",
                        "broken_urls_removed": "",
                        "hero_replaced": "",
                        "about_replaced": "",
                        "gallery_supplemented": "",
                        "address_fixed": "",
                        "default_services_flag": "",
                        "generic_about_flag": "",
                        "updated": False,
                    }
                )
        write_report(report_rows, args.report)
        logging.info("Saved interim report to %s", args.report)
        time.sleep(args.sleep_seconds)

    logging.info("Cleanup complete. Processed=%s Updated=%s Report=%s", processed, updated_count, args.report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
