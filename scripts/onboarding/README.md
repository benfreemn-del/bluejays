# Onboarding PDF Factory

Per-client AI System onboarding documents (handoff, brand voice, SLA,
value proof) — generated once per client and served from
`public/clients/<slug>/pdfs/`.

## Today (2026-05-18)

Only Tekky / Zenith Sports has shipped. PDFs are produced by the
hand-written script at `scripts/generate-zenith-onboarding-pdfs.py`
(2320 lines, Zenith-specific). Every Zenith-specific value (brand
colors, contact names, pricing, payment links, audience taxonomy)
is hardcoded inline.

That works for one client. It does **not** scale to a 1:4 cohort.

## Target shape

```
scripts/onboarding/
├── README.md                ← you are here
├── client-config.ts         ← TypeScript schema (IDE help)
├── clients/
│   ├── zenith-sports.json   ← Tekky values, extracted from the Python
│   ├── itc-quick-attach.json← ITC config — ready for Jake's sign
│   └── <next-client>.json   ← drop new clients here
└── generate-client-pdfs.py  ← future: reads a config, writes 4 PDFs
```

`client-config.ts` is the canonical schema. Every JSON file under
`clients/` matches `ClientOnboardingConfig`.

## Adding a new AI System client (today)

1. Copy `clients/itc-quick-attach.json` to `clients/<slug>.json` and
   replace every field.
2. Add the Stripe Payment Link env vars to Vercel + `.env.local`
   matching the `envVar` strings in the config (e.g.
   `STRIPE_PAYMENT_LINK_<SLUG_UPPER>_FULL`).
3. Run the generic generator:
   ```
   python scripts/onboarding/generate-client-pdfs.py --client <slug>
   ```
   - Dependencies: `pip install reportlab` (one-time per environment).
   - PDFs land at `public/clients/<slug>/pdfs/<slug>-{handoff,brand-voice,sla,value-proof}.pdf`.
   - Same flow ships any new AI System client in 30 seconds.

The generic generator covers the four standard PDFs at portable
polish. For a client who needs Tekky-level visual polish, copy
`generate-zenith-onboarding-pdfs.py` to a per-client script and
hand-tune from there — the generic generator handles every default
case; the per-client script is the escape hatch.

ITC will run the same way the day Jake signs — the config in
`clients/itc-quick-attach.json` is the pre-built source of truth.

## Future polish (when there's bandwidth)

The generic generator covers the four standard PDFs at portable
polish. If we want the generic output to match Tekky's exact visual
fidelity (logo embed, custom illustrations, animated frames, more
elaborate tables), refactor `generate-zenith-onboarding-pdfs.py` into
the generic generator's builder functions:

1. Extract the ReportLab helpers (`make_styles`, `FillLine`, header /
   footer page templates, table builders) into a shared module at
   `scripts/onboarding/lib.py`. These are not Zenith-specific.
2. Convert each PDF body builder into a function taking a parsed
   `ClientOnboardingConfig` and emitting the Platypus story:
   - `build_handoff_story(cfg)`
   - `build_brand_voice_story(cfg)`
   - `build_sla_story(cfg)`
   - `build_value_proof_story(cfg)`
3. Add `generate-client-pdfs.py --client <slug>` which loads
   `clients/<slug>.json`, parses against the schema, and runs each
   builder.
4. Keep the Tekky script in place as the reference build for the
   first refactor pass — diff the output until generic + hand-
   written produce identical PDFs.

Until that lands, the schema + per-client configs in this folder
serve as **the source of truth** for what a "$10k client config"
looks like. Refactoring later is purely a Python ergonomics win;
the config files already paved the road.

## Why JSON, not TypeScript / YAML

- **Python reads JSON natively** — no extra deps for the generator.
- TypeScript schema (`client-config.ts`) gives editor autocomplete
  when humans hand-write the JSON, and runs through normal type
  checking when consumed from the TS side.
- YAML adds parsing surface area for one line of comments. Not worth
  the trade.

## Manual override

If a specific client needs PDFs that diverge from the standard 4
(e.g. an indie author's bonus content modules), keep the per-client
hand-written script alongside the generic one. The schema's
`featureFlags.verticalExtras` is the seam to signal "this client
has extras beyond the standard cohort" so the generator can pull in
optional builder functions per slug.
