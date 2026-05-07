"use client";

/**
 * OrderConfigurator — 5-step custom order wizard for Laser Lakes.
 *
 * Flow:
 *   1. Lake — searchable picker (or "I don't see mine" → free text)
 *   2. Product — which piece (map / shadowbox / coaster set / ornament / sign)
 *   3. Size — small → xlarge per product config
 *   4. Finish — natural / walnut / ebony / weathered oak (auto-priced)
 *   5. Engraving + Contact — optional engraving line + email + name
 *
 * On submit: POST to /api/clients/inquire with intent="Laser Lakes
 * Custom Order" + the full order payload. Nate gets the alert email
 * and the lead lands in the dashboard with all the context.
 */

import { useMemo, useState } from "react";
import {
  PRODUCTS,
  searchLakes,
  formatPrice,
  ORDERS_EMAIL,
  type Lake,
  type Product,
  type ProductSize,
  type ProductFinish,
} from "@/data/laser-lakes-catalog";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const PALETTE = {
  ink: "#2b241c",
  inkSoft: "rgba(43, 36, 28, 0.65)",
  cream: "#f6f1e8",
  walnut: "#5b3d1f",
  walnutDark: "#3a2811",
  border: "rgba(43, 36, 28, 0.15)",
};

export function OrderConfigurator({
  initialLake,
}: {
  initialLake?: Lake | null;
}) {
  const [step, setStep] = useState<Step>(initialLake ? 2 : 1);
  const [lake, setLake] = useState<Lake | null>(initialLake ?? null);
  const [customLakeName, setCustomLakeName] = useState("");
  const [customLakeState, setCustomLakeState] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<ProductSize | null>(null);
  const [finish, setFinish] = useState<ProductFinish | null>(null);
  const [engravingLine, setEngravingLine] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  // Lake-pick search state
  const [lakeQ, setLakeQ] = useState("");
  const lakeResults = useMemo(() => searchLakes(lakeQ, 12), [lakeQ]);

  // Total computation for the live price stat
  const sizeAdd = product && size ? product.sizes.find((s) => s.id === size)?.addCents ?? 0 : 0;
  const finishAdd = product && finish ? product.finishes.find((f) => f.id === finish)?.addCents ?? 0 : 0;
  const total = (product?.basePriceCents ?? 0) + sizeAdd + finishAdd;

  const lakeLabel = lake ? `${lake.name} · ${lake.state}` : customLakeName ? `${customLakeName} · ${customLakeState || "?"}` : null;

  /** Compose an email to Nate with the full order spec. No backend on
   *  our side — Laser Lakes runs on Shopify, so the configurator's job
   *  ends at "hand the structured order off to Nate by email." Nate
   *  then prices it, builds the line item in his Shopify admin, and
   *  emails the customer the checkout link.
   *
   *  We open the user's mail client with a fully pre-filled subject +
   *  body so they only have to hit Send. Nate gets a clean, parseable
   *  spec block every time — no two custom-order emails look different. */
  const composeOrderEmail = (): { mailto: string } | null => {
    if (!product || !size || !finish || !email || !name) return null;
    const sizeLabel = product.sizes.find((s) => s.id === size)?.label ?? size;
    const finishLabel = product.finishes.find((f) => f.id === finish)?.label ?? finish;
    const subject = `Custom order · ${product.name} · ${lakeLabel ?? "lake"}`;
    const body = [
      `Hi Nate,`,
      ``,
      `I built this on the configurator at laserlakes.com — please send a quote + Stripe checkout link when you can.`,
      ``,
      `─── ORDER SPEC ───`,
      `Lake:        ${lakeLabel ?? "(custom — see notes)"}`,
      `Product:     ${product.name}`,
      `Size:        ${sizeLabel}`,
      `Finish:      ${finishLabel}`,
      engravingLine.trim() ? `Engraving:   "${engravingLine.trim()}"` : `Engraving:   none`,
      `Est. total:  ${formatPrice(total)}`,
      ``,
      `─── CONTACT ───`,
      `Name:        ${name}`,
      `Email:       ${email}`,
      phone ? `Phone:       ${phone}` : ``,
      ``,
      `Thanks!`,
      name,
    ]
      .filter(Boolean)
      .join("\n");
    return {
      mailto: `mailto:${ORDERS_EMAIL}?cc=${encodeURIComponent(email)}&subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`,
    };
  };

  const submit = () => {
    const composed = composeOrderEmail();
    if (!composed) return;
    // Open the customer's mail client with the order pre-filled. CC's
    // their own email so they have a copy too.
    window.location.href = composed.mailto;
    setDone(true);
  };

  if (done) {
    return (
      <div
        className="text-center py-12 px-6 rounded-lg"
        style={{ backgroundColor: PALETTE.cream, color: PALETTE.ink }}
      >
        <div className="text-5xl mb-4">⚓</div>
        <h3
          className="text-3xl mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          One last step.
        </h3>
        <p className="max-w-md mx-auto text-base leading-relaxed mb-6" style={{ color: PALETTE.inkSoft }}>
          Your mail app should have opened with the order spec pre-filled.
          Hit Send — Nate replies within 24 hours with a final price quote
          and a Shopify checkout link for your{" "}
          <span className="font-semibold" style={{ color: PALETTE.ink }}>{lakeLabel}</span> piece.
        </p>
        <p className="max-w-md mx-auto text-xs leading-relaxed" style={{ color: PALETTE.inkSoft }}>
          If your mail client didn&apos;t open, email{" "}
          <a
            href={`mailto:${ORDERS_EMAIL}`}
            className="font-semibold underline underline-offset-2"
            style={{ color: PALETTE.walnut }}
          >
            {ORDERS_EMAIL}
          </a>{" "}
          with the spec from the sidebar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      {/* ────────────────── MAIN STEP CONTENT ────────────────── */}
      <div>
        {/* Step indicator */}
        <StepIndicator step={step} />

        {/* STEP 1 — pick a lake */}
        {step === 1 && (
          <div className="mt-6">
            <SectionHeading
              eyebrow="Step 1 of 5"
              title="Which lake?"
              sub="Pick from Nate's catalog, or enter your own — every order gets a hand-cut file either way."
            />
            <input
              type="text"
              value={lakeQ}
              onChange={(e) => setLakeQ(e.target.value)}
              placeholder="Search Mille Lacs, Tahoe, Winnipesaukee…"
              autoFocus
              className="w-full px-4 py-4 rounded-md text-base sm:text-lg border-2 transition focus:outline-none"
              style={{
                backgroundColor: "rgba(43, 36, 28, 0.04)",
                borderColor: PALETTE.border,
                color: PALETTE.ink,
              }}
            />
            <ul className="mt-4 grid sm:grid-cols-2 gap-2">
              {lakeResults.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setLake(l);
                      setCustomLakeName("");
                      setCustomLakeState("");
                      setStep(2);
                    }}
                    className="w-full text-left p-3 rounded-md border-2 transition hover:translate-y-[-1px]"
                    style={{
                      borderColor: lake?.id === l.id ? PALETTE.walnut : PALETTE.border,
                      backgroundColor: lake?.id === l.id ? "rgba(91, 61, 31, 0.06)" : "transparent",
                    }}
                  >
                    <div
                      className="font-bold text-[15px]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", color: PALETTE.ink }}
                    >
                      {l.name}
                    </div>
                    <div className="text-[11px]" style={{ color: PALETTE.inkSoft }}>
                      {[l.state, l.region, l.hint].filter(Boolean).join(" · ")}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <details className="mt-6">
              <summary
                className="cursor-pointer text-sm font-semibold underline underline-offset-4"
                style={{ color: PALETTE.walnut }}
              >
                My lake isn&apos;t in the list →
              </summary>
              <div className="mt-4 grid sm:grid-cols-[1fr_120px] gap-2">
                <input
                  type="text"
                  value={customLakeName}
                  onChange={(e) => setCustomLakeName(e.target.value)}
                  placeholder="Lake name"
                  className="px-4 py-3 rounded-md border-2"
                  style={{ borderColor: PALETTE.border, backgroundColor: "rgba(43, 36, 28, 0.04)" }}
                />
                <input
                  type="text"
                  maxLength={2}
                  value={customLakeState}
                  onChange={(e) => setCustomLakeState(e.target.value.toUpperCase())}
                  placeholder="ST"
                  className="px-4 py-3 rounded-md border-2 text-center"
                  style={{ borderColor: PALETTE.border, backgroundColor: "rgba(43, 36, 28, 0.04)" }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (customLakeName.trim()) {
                    setLake(null);
                    setStep(2);
                  }
                }}
                disabled={!customLakeName.trim() || customLakeState.length !== 2}
                className="mt-3 px-5 py-2 rounded-md font-bold text-sm uppercase tracking-wider transition disabled:opacity-40"
                style={{ backgroundColor: PALETTE.walnut, color: PALETTE.cream }}
              >
                Use this lake →
              </button>
            </details>
          </div>
        )}

        {/* STEP 2 — pick a product */}
        {step === 2 && (
          <div className="mt-6">
            <SectionHeading
              eyebrow="Step 2 of 5"
              title="Which piece?"
              sub={`For ${lakeLabel ?? "your lake"}.`}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              {PRODUCTS.map((p) => {
                const active = product?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProduct(p);
                      setSize(p.sizes[0]?.id ?? null);
                      setFinish(p.finishes[0]?.id ?? null);
                      setStep(3);
                    }}
                    className="text-left p-4 rounded-md border-2 transition hover:translate-y-[-2px]"
                    style={{
                      borderColor: active ? PALETTE.walnut : PALETTE.border,
                      backgroundColor: active ? "rgba(91, 61, 31, 0.06)" : "transparent",
                    }}
                  >
                    <div
                      className="font-bold text-base"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", color: PALETTE.ink }}
                    >
                      {p.name}
                    </div>
                    <div className="text-xs leading-relaxed mt-1" style={{ color: PALETTE.inkSoft }}>
                      {p.blurb}
                    </div>
                    <div
                      className="mt-3 text-sm font-bold"
                      style={{ color: PALETTE.walnut }}
                    >
                      from {formatPrice(p.basePriceCents)}
                    </div>
                  </button>
                );
              })}
            </div>
            <BackBtn onClick={() => setStep(1)} />
          </div>
        )}

        {/* STEP 3 — size */}
        {step === 3 && product && (
          <div className="mt-6">
            <SectionHeading eyebrow="Step 3 of 5" title="What size?" />
            <div className="space-y-2">
              {product.sizes.map((s) => {
                const active = size === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSize(s.id);
                      setStep(4);
                    }}
                    className="w-full text-left p-4 rounded-md border-2 transition flex items-center justify-between"
                    style={{
                      borderColor: active ? PALETTE.walnut : PALETTE.border,
                      backgroundColor: active ? "rgba(91, 61, 31, 0.06)" : "transparent",
                    }}
                  >
                    <span
                      className="font-bold"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", color: PALETTE.ink }}
                    >
                      {s.label}
                    </span>
                    <span className="text-sm font-bold" style={{ color: PALETTE.walnut }}>
                      {s.addCents === 0 ? "included" : `+ ${formatPrice(s.addCents)}`}
                    </span>
                  </button>
                );
              })}
            </div>
            <BackBtn onClick={() => setStep(2)} />
          </div>
        )}

        {/* STEP 4 — finish */}
        {step === 4 && product && (
          <div className="mt-6">
            <SectionHeading eyebrow="Step 4 of 5" title="Finish?" sub="The wood does most of the work; the finish sets the mood." />
            <div className="grid sm:grid-cols-2 gap-3">
              {product.finishes.map((f) => {
                const active = finish === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFinish(f.id);
                      setStep(5);
                    }}
                    className="text-left p-4 rounded-md border-2 transition flex flex-col gap-2 hover:translate-y-[-1px]"
                    style={{
                      borderColor: active ? PALETTE.walnut : PALETTE.border,
                      backgroundColor: active ? "rgba(91, 61, 31, 0.06)" : "transparent",
                    }}
                  >
                    {/* Color swatch */}
                    <div
                      className="h-12 rounded"
                      style={{
                        background: SWATCHES[f.id],
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: PALETTE.ink }}
                      >
                        {f.label}
                      </span>
                      <span className="text-sm font-bold" style={{ color: PALETTE.walnut }}>
                        {f.addCents === 0 ? "included" : `+ ${formatPrice(f.addCents)}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <BackBtn onClick={() => setStep(3)} />
          </div>
        )}

        {/* STEP 5 — engraving + contact */}
        {step === 5 && product && (
          <div className="mt-6">
            <SectionHeading
              eyebrow="Step 5 of 5"
              title="Last details."
              sub={
                product.engravable
                  ? "Optional engraved line — family name, established year, GPS coords. Anything that fits in 50 characters."
                  : "Just your contact info and you're done."
              }
            />
            <div className="space-y-3">
              {product.engravable && (
                <Field label="Engraving (optional)">
                  <input
                    type="text"
                    maxLength={50}
                    value={engravingLine}
                    onChange={(e) => setEngravingLine(e.target.value)}
                    placeholder="The Williams Family · Est. 2008"
                    className="w-full px-4 py-3 rounded-md border-2"
                    style={{ borderColor: PALETTE.border, backgroundColor: "rgba(43, 36, 28, 0.04)" }}
                  />
                  <div className="text-xs mt-1" style={{ color: PALETTE.inkSoft }}>
                    {engravingLine.length} / 50
                  </div>
                </Field>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Your name *">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-md border-2"
                    style={{ borderColor: PALETTE.border, backgroundColor: "rgba(43, 36, 28, 0.04)" }}
                  />
                </Field>
                <Field label="Phone (optional)">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border-2"
                    style={{ borderColor: PALETTE.border, backgroundColor: "rgba(43, 36, 28, 0.04)" }}
                  />
                </Field>
              </div>
              <Field label="Email *">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-md border-2"
                  style={{ borderColor: PALETTE.border, backgroundColor: "rgba(43, 36, 28, 0.04)" }}
                />
              </Field>
              <button
                type="button"
                onClick={submit}
                disabled={!name || !email}
                className="w-full px-6 py-4 rounded-md font-extrabold uppercase tracking-[0.18em] text-sm transition disabled:opacity-40 hover:translate-y-[-1px]"
                style={{ backgroundColor: PALETTE.walnut, color: PALETTE.cream }}
              >
                Email Nate my order · {formatPrice(total)}
              </button>
              <p className="text-xs text-center leading-relaxed" style={{ color: PALETTE.inkSoft }}>
                Opens your mail app with the spec pre-filled. Nate replies
                within 24 hours with a Shopify checkout link.
              </p>
              <BackBtn onClick={() => setStep(4)} />
            </div>
          </div>
        )}
      </div>

      {/* ────────────────── LIVE SUMMARY SIDEBAR ────────────────── */}
      <aside
        className="rounded-md p-5 lg:sticky lg:top-24 self-start border-2"
        style={{
          backgroundColor: "rgba(43, 36, 28, 0.04)",
          borderColor: PALETTE.border,
          color: PALETTE.ink,
        }}
      >
        <div
          className="text-[10px] tracking-[0.32em] uppercase font-extrabold mb-3"
          style={{ color: PALETTE.walnut }}
        >
          Your piece
        </div>
        <SummaryRow label="Lake" value={lakeLabel ?? "—"} />
        <SummaryRow label="Product" value={product?.name ?? "—"} />
        <SummaryRow
          label="Size"
          value={
            size && product
              ? product.sizes.find((s) => s.id === size)?.label ?? "—"
              : "—"
          }
        />
        <SummaryRow
          label="Finish"
          value={
            finish && product
              ? product.finishes.find((f) => f.id === finish)?.label ?? "—"
              : "—"
          }
        />
        {engravingLine && (
          <SummaryRow label="Engraving" value={`"${engravingLine}"`} />
        )}
        <hr className="my-4" style={{ borderColor: PALETTE.border }} />
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] tracking-[0.22em] uppercase font-bold" style={{ color: PALETTE.inkSoft }}>
            Estimated total
          </span>
          <span
            className="text-3xl font-black tabular-nums"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: PALETTE.ink }}
          >
            {total > 0 ? formatPrice(total) : "—"}
          </span>
        </div>
        {product?.leadDays && (
          <div className="mt-2 text-[11px]" style={{ color: PALETTE.inkSoft }}>
            ~{product.leadDays} business days from order to ship.
          </div>
        )}
      </aside>
    </div>
  );
}

const SWATCHES: Record<ProductFinish, string> = {
  "natural-birch": "linear-gradient(135deg, #e8d6a8 0%, #d4b87a 100%)",
  "walnut-stain": "linear-gradient(135deg, #6b4423 0%, #3a2811 100%)",
  "ebony-stain": "linear-gradient(135deg, #2a1f15 0%, #100b07 100%)",
  "weathered-oak": "linear-gradient(135deg, #b09e85 0%, #8a7860 100%)",
};

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className="block h-1 rounded-full transition-all"
          style={{
            width: s === step ? 32 : 16,
            backgroundColor:
              s < step ? PALETTE.walnut : s === step ? PALETTE.walnut : "rgba(43, 36, 28, 0.15)",
          }}
        />
      ))}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-5">
      <div
        className="text-[10px] tracking-[0.32em] uppercase font-extrabold mb-2"
        style={{ color: PALETTE.walnut }}
      >
        {eyebrow}
      </div>
      <h3
        className="text-2xl sm:text-3xl"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: PALETTE.ink }}
      >
        {title}
      </h3>
      {sub && (
        <p className="mt-2 text-sm leading-relaxed" style={{ color: PALETTE.inkSoft }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="text-[10px] tracking-[0.22em] uppercase font-bold block mb-1.5"
        style={{ color: PALETTE.inkSoft }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-2">
      <span
        className="text-[10px] tracking-[0.22em] uppercase font-bold"
        style={{ color: PALETTE.inkSoft }}
      >
        {label}
      </span>
      <span
        className="text-sm font-semibold text-right truncate"
        style={{ color: PALETTE.ink, maxWidth: 180 }}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-5 text-sm font-semibold underline underline-offset-4"
      style={{ color: PALETTE.inkSoft }}
    >
      ← Back
    </button>
  );
}

export default OrderConfigurator;
