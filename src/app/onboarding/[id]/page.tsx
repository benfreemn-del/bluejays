"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  getPrefillData,
  type OnboardingPrefillData,
  type TestimonialPrefill,
} from "@/lib/onboarding-prefill";

/**
 * 3-Step post-purchase onboarding form.
 *
 * Spec (CLAUDE.md Rule 41):
 *   - Step 1 (~3 min, 5 fields): essentials — business name, phone, email,
 *     logo upload, brand colors. After Save & Continue, status flips to
 *     `step1_complete` and Ben can already start working.
 *   - Step 2 (~5-7 min, 8 fields): content — services, about, tagline,
 *     photos, testimonials, hours.
 *   - Step 3 (~2 min, 5 fields): preferences — theme, languages, special
 *     requests, domain, anything else.
 *
 * UX rules:
 *   - Progress bar at top with green checkmarks on completed steps
 *   - Save & Continue persists to Supabase + advances step
 *   - "Skip — I'll email you later" link on Step 2 + Step 3
 *   - Form auto-saves to localStorage on every blur as backup
 *   - Pre-filled from prospect.scrapedData via getPrefillData()
 *   - Mobile-first responsive layout
 *
 * Backwards compat: prospect records with no onboarding row still work.
 * Existing single-page submissions remain queryable in the same form_data
 * jsonb column.
 */

interface ProspectInfo {
  businessName: string;
  status: string;
}

type OnboardingStatus = "step1_complete" | "step2_complete" | "completed";

interface FormData extends OnboardingPrefillData {
  // Step 3 — Preferences
  themePreference: "light" | "dark" | "let-ben-decide" | "";
  languages: "english-only" | "english-spanish" | "other" | "";
  languagesOther: string;
  specialRequests: string;
  anythingElse: string;
}

const EMPTY_TESTIMONIAL: TestimonialPrefill = { name: "", quote: "", city: "" };

const initialFormData: FormData = {
  businessName: "",
  phone: "",
  email: "",
  logoUrl: "",
  primaryColor: "",
  accentColor: "",
  services: "",
  about: "",
  tagline: "",
  hours: "",
  testimonials: [
    { ...EMPTY_TESTIMONIAL },
    { ...EMPTY_TESTIMONIAL },
    { ...EMPTY_TESTIMONIAL },
  ],
  socialLinks: "",
  domainPreference: "",
  themePreference: "",
  languages: "",
  languagesOther: "",
  specialRequests: "",
  anythingElse: "",
};

export default function OnboardingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const prospectId = params.id as string;
  const sessionId = searchParams.get("session_id");
  const stepParam = searchParams.get("step");

  const [prospect, setProspect] = useState<ProspectInfo | null>(null);
  const [data, setData] = useState<FormData>(initialFormData);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<1 | 2 | 3>>(new Set());
  const [saving, setSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(!!sessionId);
  const [logoUploading, setLogoUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const localStorageKey = useMemo(() => `bluejays_onboarding_${prospectId}`, [prospectId]);

  // ── Fetch prospect + prefill on mount ─────────────────────────────────
  useEffect(() => {
    if (!prospectId) return;

    let cancelled = false;
    (async () => {
      try {
        // 1) Pull prospect (with scrapedData) to seed prefill
        const prospectRes = await fetch(`/api/prospects/${prospectId}`);
        const prospectInfo = await prospectRes.json();
        if (!prospectInfo.error && !cancelled) {
          setProspect({
            businessName: prospectInfo.businessName,
            status: prospectInfo.status,
          });
          const prefill = getPrefillData(prospectInfo);
          setData((prev) => ({ ...prev, ...prefill }));
        }

        // 2) Pull existing onboarding (resume support)
        const onboardingRes = await fetch(`/api/onboarding/${prospectId}`);
        if (onboardingRes.ok && !cancelled) {
          const existing = await onboardingRes.json();
          // Merge any saved fields back in — overrides prefill
          setData((prev) => mergeFormData(prev, existing));
          // Advance step based on saved status
          const status = existing._onboardingStatus as OnboardingStatus | undefined;
          const completed = new Set<1 | 2 | 3>();
          if (status === "step1_complete") {
            completed.add(1);
            setStep(2);
          } else if (status === "step2_complete") {
            completed.add(1);
            completed.add(2);
            setStep(3);
          } else if (status === "completed") {
            completed.add(1);
            completed.add(2);
            completed.add(3);
            // Already done — bounce to welcome page
            router.replace(`/welcome/${prospectId}`);
            return;
          }
          setCompletedSteps(completed);
          if (Array.isArray(existing.photos)) setPhotos(existing.photos);
        }

        // 3) localStorage backup overrides everything (most recent draft)
        if (typeof window !== "undefined" && !cancelled) {
          const saved = window.localStorage.getItem(localStorageKey);
          if (saved) {
            try {
              const parsed = JSON.parse(saved) as { data?: Partial<FormData>; photos?: string[] };
              if (parsed.data) setData((prev) => ({ ...prev, ...parsed.data }));
              if (Array.isArray(parsed.photos)) setPhotos(parsed.photos);
            } catch {
              // bad JSON — ignore
            }
          }
        }
      } catch (err) {
        console.error("[onboarding] mount fetch failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [prospectId, localStorageKey, router]);

  // Allow ?step=1|2|3 override for resume / direct linking
  useEffect(() => {
    if (stepParam === "1") setStep(1);
    else if (stepParam === "2") setStep(2);
    else if (stepParam === "3") setStep(3);
  }, [stepParam]);

  // ── Auto-save to localStorage on every change ────────────────────────
  const persistDraft = useCallback(
    (nextData: FormData, nextPhotos: string[]) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(
          localStorageKey,
          JSON.stringify({ data: nextData, photos: nextPhotos })
        );
      } catch {
        // localStorage might be full or disabled — non-fatal
      }
    },
    [localStorageKey]
  );

  const handleBlur = useCallback(() => {
    persistDraft(data, photos);
  }, [data, photos, persistDraft]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateTestimonial = (
    index: number,
    field: keyof TestimonialPrefill,
    value: string
  ) => {
    setData((prev) => {
      const next = [...prev.testimonials];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, testimonials: next };
    });
  };

  // ── File upload helpers ──────────────────────────────────────────────
  const uploadFile = async (file: File, type: "logo" | "photos"): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch(`/api/onboarding/upload/${prospectId}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(errBody.error || `Upload failed (${res.status})`);
    }
    const json = await res.json();
    return json.url as string;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > 5 * 1024 * 1024) {
      setError("Logo must be under 5MB");
      return;
    }
    setLogoUploading(true);
    try {
      const url = await uploadFile(file, "logo");
      updateField("logoUrl", url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLogoUploading(false);
    }
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    const remainingSlots = Math.max(0, 10 - photos.length);
    const toUpload = files.slice(0, remainingSlots);
    if (toUpload.length === 0) {
      setError("You've already uploaded 10 photos (the max).");
      return;
    }
    setPhotoUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`Skipped ${file.name} — over 10MB`);
          continue;
        }
        const url = await uploadFile(file, "photos");
        urls.push(url);
      }
      setPhotos((prev) => {
        const next = [...prev, ...urls];
        persistDraft(data, next);
        return next;
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => {
      const next = prev.filter((p) => p !== url);
      persistDraft(data, next);
      return next;
    });
  };

  // ── Save handlers per step ───────────────────────────────────────────
  const buildPayload = (forStep: 1 | 2 | 3) => {
    const stepKey = `step${forStep}` as "step1" | "step2" | "step3";
    if (forStep === 1) {
      return {
        step: stepKey,
        businessName: data.businessName,
        phone: data.phone,
        email: data.email,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
      };
    }
    if (forStep === 2) {
      return {
        step: stepKey,
        services: data.services,
        about: data.about,
        tagline: data.tagline,
        hours: data.hours,
        testimonials: data.testimonials.filter((t) => t.name || t.quote),
        photos,
      };
    }
    return {
      step: stepKey,
      themePreference: data.themePreference,
      languages: data.languages,
      languagesOther: data.languagesOther,
      specialRequests: data.specialRequests,
      domainPreference: data.domainPreference,
      anythingElse: data.anythingElse,
      // Round-trip the rest so the merged record stays complete on the
      // server side (the API merges with existing form_data, but if any
      // of these fields haven't been seen yet they need to land here).
      socialLinks: data.socialLinks,
    };
  };

  const submitStep = async (forStep: 1 | 2 | 3, advance = true) => {
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload(forStep);
      const res = await fetch(`/api/onboarding/${prospectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Save failed" }));
        throw new Error(body.error || "Save failed");
      }
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.add(forStep);
        return next;
      });
      persistDraft(data, photos);

      if (forStep === 3) {
        // Final submit — clear localStorage draft and go to welcome page
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(localStorageKey);
        }
        router.push(`/welcome/${prospectId}`);
        return;
      }

      if (advance && forStep < 3) {
        setStep((forStep + 1) as 1 | 2 | 3);
        // Scroll to top so users see step 2/3 from the start
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // ── Confirmation screen (Stripe redirect) ────────────────────────────
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mx-auto mb-6 flex items-center justify-center text-4xl text-white">
            &#10003;
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-muted text-lg mb-2">
            {prospect
              ? `Thank you for choosing BlueJays for ${prospect.businessName}!`
              : "Thank you for choosing BlueJays!"}
          </p>
          <p className="text-muted mb-8">
            Now let&apos;s get the essentials so I can start customizing your site. Step 1 takes about 3 minutes.
          </p>

          <button
            onClick={() => setShowConfirmation(false)}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-electric to-blue-deep text-white font-semibold text-lg hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-shadow"
          >
            Start Onboarding (3 min)
          </button>
          <p className="text-muted text-xs mt-4">
            Your draft auto-saves so you can finish later.
          </p>
        </div>
      </div>
    );
  }

  // ── Main 3-step form ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {prospect ? `${prospect.businessName} — Onboarding` : "Onboarding"}
          </h1>
          <p className="text-muted text-sm sm:text-base">
            3 quick steps. Step 1 is the only one I need to get started — the rest are improvements.
          </p>
          <ProgressBar currentStep={step} completed={completedSteps} onJump={(n) => setStep(n)} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <Step1
            data={data}
            updateField={updateField}
            handleBlur={handleBlur}
            onLogoUpload={handleLogoUpload}
            logoUploading={logoUploading}
            saving={saving}
            onContinue={() => submitStep(1)}
          />
        )}

        {step === 2 && (
          <Step2
            data={data}
            photos={photos}
            updateField={updateField}
            updateTestimonial={updateTestimonial}
            handleBlur={handleBlur}
            onPhotosUpload={handlePhotosUpload}
            photoUploading={photoUploading}
            removePhoto={removePhoto}
            saving={saving}
            onContinue={() => submitStep(2)}
            onSkip={async () => {
              // Save current step 2 data as step1_complete (don't advance the
              // server status to step2_complete since they didn't fill it in)
              // and just jump the UI to step 3.
              setStep(3);
              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3
            data={data}
            updateField={updateField}
            handleBlur={handleBlur}
            saving={saving}
            onSubmit={() => submitStep(3)}
            onSkip={async () => {
              // Submit whatever's there as final (mark complete) so Ben gets
              // the SMS and the prospect can move forward.
              await submitStep(3);
            }}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

function mergeFormData(prev: FormData, existing: Record<string, unknown>): FormData {
  const next: FormData = { ...prev };
  // Only merge known keys to avoid leaking _onboardingStatus etc. into UI state
  const stringKeys: (keyof FormData)[] = [
    "businessName",
    "phone",
    "email",
    "logoUrl",
    "primaryColor",
    "accentColor",
    "services",
    "about",
    "tagline",
    "hours",
    "socialLinks",
    "domainPreference",
    "languagesOther",
    "specialRequests",
    "anythingElse",
  ];
  for (const k of stringKeys) {
    const v = existing[k];
    if (typeof v === "string" && v.trim()) {
      (next[k] as string) = v;
    }
  }
  if (
    existing.themePreference === "light" ||
    existing.themePreference === "dark" ||
    existing.themePreference === "let-ben-decide"
  ) {
    next.themePreference = existing.themePreference;
  }
  if (
    existing.languages === "english-only" ||
    existing.languages === "english-spanish" ||
    existing.languages === "other"
  ) {
    next.languages = existing.languages;
  }
  if (Array.isArray(existing.testimonials)) {
    next.testimonials = [0, 1, 2].map((i) => {
      const t = (existing.testimonials as Array<Partial<TestimonialPrefill>>)[i];
      if (!t) return { ...EMPTY_TESTIMONIAL };
      return {
        name: typeof t.name === "string" ? t.name : "",
        quote: typeof t.quote === "string" ? t.quote : "",
        city: typeof t.city === "string" ? t.city : "",
      };
    });
  }
  return next;
}

// ──────────────────────────────────────────────────────────────────────
// Progress Bar
// ──────────────────────────────────────────────────────────────────────

function ProgressBar({
  currentStep,
  completed,
  onJump,
}: {
  currentStep: 1 | 2 | 3;
  completed: Set<1 | 2 | 3>;
  onJump: (step: 1 | 2 | 3) => void;
}) {
  const stepLabels: Array<{ n: 1 | 2 | 3; label: string }> = [
    { n: 1, label: "Essentials" },
    { n: 2, label: "Content" },
    { n: 3, label: "Preferences" },
  ];

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-2">
        <span className="text-muted">Step {currentStep} of 3</span>
        <span className="text-muted hidden sm:inline">
          ~{currentStep === 1 ? "3" : currentStep === 2 ? "5-7" : "2"} min
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {stepLabels.map(({ n, label }, idx) => {
          const isDone = completed.has(n);
          const isActive = currentStep === n;
          const canJump = isDone || n < currentStep;
          return (
            <div key={n} className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && onJump(n)}
                className={[
                  "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition",
                  isDone
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-gradient-to-br from-blue-electric to-blue-deep text-white"
                      : "bg-surface border border-border text-muted",
                  canJump ? "cursor-pointer hover:scale-105" : "cursor-default",
                ].join(" ")}
                aria-label={`Step ${n}: ${label}${isDone ? " (completed)" : ""}`}
              >
                {isDone ? "✓" : n}
              </button>
              <span
                className={[
                  "text-xs sm:text-sm truncate",
                  isActive ? "font-semibold text-foreground" : "text-muted",
                ].join(" ")}
              >
                {label}
              </span>
              {idx < stepLabels.length - 1 && (
                <div className="flex-1 h-0.5 bg-border ml-1 hidden sm:block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Step 1 — Essentials
// ──────────────────────────────────────────────────────────────────────

function Step1({
  data,
  updateField,
  handleBlur,
  onLogoUpload,
  logoUploading,
  saving,
  onContinue,
}: {
  data: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  handleBlur: () => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  logoUploading: boolean;
  saving: boolean;
  onContinue: () => void;
}) {
  const canContinue = !!data.businessName && !!data.phone && !!data.email;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">The essentials (3 min)</h2>
        <p className="text-sm text-muted">
          This is everything I need to start working. The rest of the form just makes the site even better.
        </p>
      </div>

      <Field
        label="Business Name"
        name="businessName"
        value={data.businessName}
        onChange={(e) => updateField("businessName", e.target.value)}
        onBlur={handleBlur}
        required
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Phone Number"
          name="phone"
          value={data.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          onBlur={handleBlur}
          required
          type="tel"
        />
        <Field
          label="Email Address"
          name="email"
          value={data.email}
          onChange={(e) => updateField("email", e.target.value)}
          onBlur={handleBlur}
          required
          type="email"
        />
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Your Logo <span className="text-muted font-normal">(JPEG, PNG, or SVG · max 5MB)</span>
        </label>
        {data.logoUrl ? (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.logoUrl}
              alt="Your logo"
              className="w-20 h-20 object-contain bg-white rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Logo uploaded</p>
              <button
                type="button"
                onClick={() => updateField("logoUrl", "")}
                className="text-xs text-red-400 mt-1 hover:underline"
              >
                Remove and re-upload
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 sm:h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-blue-electric/60 transition bg-surface">
            <input
              type="file"
              accept="image/jpeg,image/png,image/svg+xml"
              onChange={onLogoUpload}
              className="hidden"
              disabled={logoUploading}
            />
            <span className="text-sm text-muted">
              {logoUploading ? "Uploading..." : "Tap to upload your logo"}
            </span>
            <span className="text-xs text-muted/60 mt-1">JPEG · PNG · SVG up to 5MB</span>
          </label>
        )}
        <p className="text-xs text-muted mt-2">
          Don&apos;t have a logo? Skip this and I&apos;ll create one for you.
        </p>
      </div>

      {/* Brand colors */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Brand Colors <span className="text-muted font-normal">(pick from your existing brand)</span>
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <ColorPicker
            label="Primary"
            value={data.primaryColor}
            onChange={(v) => updateField("primaryColor", v)}
            onBlur={handleBlur}
          />
          <ColorPicker
            label="Accent"
            value={data.accentColor}
            onChange={(v) => updateField("accentColor", v)}
            onBlur={handleBlur}
          />
        </div>
        <p className="text-xs text-muted mt-2">
          Not sure? Leave blank — I&apos;ll pick what fits your industry.
        </p>
      </div>

      <button
        type="button"
        disabled={!canContinue || saving}
        onClick={onContinue}
        className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-electric to-blue-deep text-white font-semibold text-lg disabled:opacity-50 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-shadow"
      >
        {saving ? "Saving..." : "Save & Continue →"}
      </button>
      <p className="text-xs text-muted text-center">
        Your draft auto-saves on every field. Close the tab anytime — you&apos;ll resume right where you left off.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Step 2 — Content
// ──────────────────────────────────────────────────────────────────────

function Step2({
  data,
  photos,
  updateField,
  updateTestimonial,
  handleBlur,
  onPhotosUpload,
  photoUploading,
  removePhoto,
  saving,
  onContinue,
  onSkip,
  onBack,
}: {
  data: FormData;
  photos: string[];
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  updateTestimonial: (i: number, field: keyof TestimonialPrefill, v: string) => void;
  handleBlur: () => void;
  onPhotosUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  photoUploading: boolean;
  removePhoto: (url: string) => void;
  saving: boolean;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Content (5-7 min)</h2>
        <p className="text-sm text-muted">
          I pre-filled what I could from your existing site — just edit if anything&apos;s wrong.
        </p>
      </div>

      <TextArea
        label="Services Offered"
        helper="One per line — edit if I got these wrong"
        name="services"
        value={data.services}
        onChange={(e) => updateField("services", e.target.value)}
        onBlur={handleBlur}
        rows={5}
      />

      <TextArea
        label="About Us"
        helper="Short paragraph about your business"
        name="about"
        value={data.about}
        onChange={(e) => updateField("about", e.target.value)}
        onBlur={handleBlur}
        rows={4}
      />

      <Field
        label="Tagline"
        helper="One line — what you do, who you serve"
        name="tagline"
        value={data.tagline}
        onChange={(e) => updateField("tagline", e.target.value)}
        onBlur={handleBlur}
      />

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Real Photos <span className="text-muted font-normal">(up to 10 · JPEG/PNG/WebP · max 10MB each)</span>
        </label>
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {photos.map((url) => (
              <div
                key={url}
                className="relative aspect-square rounded-lg overflow-hidden bg-surface border border-border group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 10 && (
          <label className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-blue-electric/60 transition bg-surface">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onPhotosUpload}
              className="hidden"
              disabled={photoUploading}
            />
            <span className="text-sm text-muted">
              {photoUploading ? "Uploading..." : `Tap to upload photos (${photos.length}/10)`}
            </span>
            <span className="text-xs text-muted/60 mt-1">Hero, gallery, team, etc.</span>
          </label>
        )}
      </div>

      {/* Testimonials */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Testimonials <span className="text-muted font-normal">(optional · up to 3)</span>
        </label>
        <div className="space-y-3">
          {data.testimonials.map((t, i) => (
            <div key={i} className="p-3 sm:p-4 rounded-xl bg-surface border border-border space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Customer name"
                  value={t.name}
                  onChange={(e) => updateTestimonial(i, "name", e.target.value)}
                  onBlur={handleBlur}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted/50"
                />
                <input
                  type="text"
                  placeholder="City (optional)"
                  value={t.city}
                  onChange={(e) => updateTestimonial(i, "city", e.target.value)}
                  onBlur={handleBlur}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted/50"
                />
              </div>
              <textarea
                placeholder="What they said about you..."
                value={t.quote}
                onChange={(e) => updateTestimonial(i, "quote", e.target.value)}
                onBlur={handleBlur}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted/50 resize-y"
              />
            </div>
          ))}
        </div>
      </div>

      <Field
        label="Hours of Operation"
        helper="e.g., Mon-Fri 9am-5pm, Sat 10am-2pm"
        name="hours"
        value={data.hours}
        onChange={(e) => updateField("hours", e.target.value)}
        onBlur={handleBlur}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          className="sm:w-32 h-12 rounded-xl bg-surface border border-border text-foreground font-medium hover:bg-surface/80 transition"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onContinue}
          className="flex-1 h-14 rounded-xl bg-gradient-to-r from-blue-electric to-blue-deep text-white font-semibold text-lg disabled:opacity-50 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-shadow"
        >
          {saving ? "Saving..." : "Save & Continue →"}
        </button>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="w-full text-sm text-muted hover:text-foreground transition"
      >
        Skip — I&apos;ll email you these later
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Step 3 — Preferences
// ──────────────────────────────────────────────────────────────────────

function Step3({
  data,
  updateField,
  handleBlur,
  saving,
  onSubmit,
  onSkip,
  onBack,
}: {
  data: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  handleBlur: () => void;
  saving: boolean;
  onSubmit: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Preferences (2 min)</h2>
        <p className="text-sm text-muted">
          Last step. These are optional — leave blank if you don&apos;t care.
        </p>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium mb-2">Theme Preference</label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { v: "light" as const, label: "Light" },
            { v: "dark" as const, label: "Dark" },
            { v: "let-ben-decide" as const, label: "Let Ben decide" },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => updateField("themePreference", opt.v)}
              className={[
                "h-12 rounded-xl border text-sm font-medium transition",
                data.themePreference === opt.v
                  ? "border-blue-electric bg-blue-electric/10 text-foreground"
                  : "border-border bg-surface text-muted hover:text-foreground",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium mb-2">Languages</label>
        <div className="grid sm:grid-cols-3 gap-2 sm:gap-3">
          {[
            { v: "english-only" as const, label: "English only" },
            { v: "english-spanish" as const, label: "English + Spanish" },
            { v: "other" as const, label: "Other" },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => updateField("languages", opt.v)}
              className={[
                "h-12 rounded-xl border text-sm font-medium transition",
                data.languages === opt.v
                  ? "border-blue-electric bg-blue-electric/10 text-foreground"
                  : "border-border bg-surface text-muted hover:text-foreground",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {data.languages === "other" && (
          <Field
            label=""
            name="languagesOther"
            value={data.languagesOther}
            onChange={(e) => updateField("languagesOther", e.target.value)}
            onBlur={handleBlur}
            placeholder="Which languages?"
          />
        )}
      </div>

      <TextArea
        label="Special Requests"
        helper="Anything specific you want? (online booking, payment portal, chat widget, etc.)"
        name="specialRequests"
        value={data.specialRequests}
        onChange={(e) => updateField("specialRequests", e.target.value)}
        onBlur={handleBlur}
        rows={3}
      />

      <Field
        label="Domain Preference"
        helper="e.g., bluejaybob.com — I'll register it after you approve the final site"
        name="domainPreference"
        value={data.domainPreference}
        onChange={(e) => updateField("domainPreference", e.target.value)}
        onBlur={handleBlur}
      />

      <TextArea
        label="Anything Else?"
        helper="Last chance — anything I missed"
        name="anythingElse"
        value={data.anythingElse}
        onChange={(e) => updateField("anythingElse", e.target.value)}
        onBlur={handleBlur}
        rows={3}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          className="sm:w-32 h-12 rounded-xl bg-surface border border-border text-foreground font-medium hover:bg-surface/80 transition"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onSubmit}
          className="flex-1 h-14 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-lg disabled:opacity-50 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-shadow"
        >
          {saving ? "Submitting..." : "Submit & Get Started"}
        </button>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="w-full text-sm text-muted hover:text-foreground transition"
      >
        Skip — I&apos;ll email you later
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Reusable inputs
// ──────────────────────────────────────────────────────────────────────

function Field({
  label,
  helper,
  name,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  helper?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {helper && <p className="text-xs text-muted mb-2">{helper}</p>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        className="w-full h-11 px-3 rounded-lg bg-surface border border-border text-foreground text-base sm:text-sm placeholder:text-muted/50"
      />
    </div>
  );
}

function TextArea({
  label,
  helper,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 4,
}: {
  label: string;
  helper?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {helper && <p className="text-xs text-muted mb-2">{helper}</p>}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-base sm:text-sm placeholder:text-muted/50 resize-y"
      />
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}) {
  // Browser color inputs require valid 6-digit hex; default to a neutral gray
  // when value is blank so the input renders without console warnings.
  const safeValue = /^#[0-9a-fA-F]{6}$/.test(value || "") ? value : "#888888";
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
      <input
        type="color"
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="w-12 h-12 rounded-lg border border-border cursor-pointer bg-transparent"
        aria-label={`${label} color picker`}
      />
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-muted mb-0.5">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="#0066ff"
          className="w-full h-8 px-2 rounded bg-background border border-border text-foreground text-sm"
        />
      </div>
    </div>
  );
}
