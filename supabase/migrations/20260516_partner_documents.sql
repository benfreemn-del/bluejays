-- Partner-uploaded legal documents (W-9, signed IC agreement, banking
-- confirmation). Stored as base64 text inline so we don't depend on a
-- Supabase Storage bucket — these files are small (W-9 PDFs are
-- typically 50–200KB) and rarely accessed. When the volume ever grows
-- past a couple dozen partners, we'll migrate to Storage.
--
-- Idempotent — safe to re-run.
--
-- Companion: src/app/partners/[code]/w9 (public-by-code upload page) and
-- /api/partners/[code]/upload-w9 (POST endpoint with size + MIME guard).

create extension if not exists "uuid-ossp";

create table if not exists public.partner_documents (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  -- 'w9' | 'ic-agreement' | 'banking' | 'other'
  kind text not null,
  -- Uploaded filename (sanitized) — kept for the download UI.
  filename text not null,
  -- MIME type as reported by the browser. We only ACCEPT application/pdf
  -- for w9 today, but storing the type keeps the table generic.
  mime_type text not null,
  -- Decoded byte length — useful for the admin list without having to
  -- decode the base64.
  size_bytes integer not null,
  -- The file payload, base64-encoded. We use TEXT (not bytea) so
  -- responses can hand it straight to a data URL or download stream
  -- without an extra encode step.
  content_base64 text not null,
  -- Free-form note from Ben after review (e.g., "TIN matches W-9").
  reviewed_at timestamptz,
  reviewed_note text,
  created_at timestamptz not null default now()
);

create index if not exists partner_documents_partner_idx
  on public.partner_documents(partner_id);

create index if not exists partner_documents_kind_idx
  on public.partner_documents(kind);

-- A partner can re-upload — we keep all versions (don't unique on kind)
-- so an audit trail survives. The latest row wins for "is W-9 on file?"
-- checks via order by created_at desc.

-- ─── partners.w9_received_at ─────────────────────────────────────────
-- Quick lookup flag so the admin dashboard doesn't have to join into
-- partner_documents on every render. Set by the upload API; cleared
-- only manually if Ben rejects a W-9.
alter table public.partners
  add column if not exists w9_received_at timestamptz;

-- Optional Ben-side note: "needs corrected TIN" / "approved 2026-05-12".
alter table public.partners
  add column if not exists w9_review_note text;
