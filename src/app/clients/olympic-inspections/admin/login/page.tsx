"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OIT_OWNER_EMAIL = "hello@olympicinspect.com";
const SLUG = "olympic-inspections";

export default function OITLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/client-portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: OIT_OWNER_EMAIL,
          password: password.trim(),
          slug: SLUG,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Login failed");
        setBusy(false);
        return;
      }
      router.push("/clients/olympic-inspections/admin");
    } catch {
      setError("Network error — please try again");
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #faf6ee 0%, #f3ecd9 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        color: "#1f2a1c",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 14,
          padding: 36,
          boxShadow:
            "0 24px 48px -16px rgba(31, 42, 28, 0.20), 0 6px 14px -8px rgba(45, 74, 45, 0.12)",
          border: "1px solid rgba(31, 42, 28, 0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            style={{
              fontFamily: "Merriweather, Georgia, serif",
              fontSize: 22,
              fontWeight: 700,
              color: "#2d4a2d",
            }}
          >
            Olympic Inspections
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#7a857a",
              marginTop: 4,
            }}
          >
            Owner sign-in
          </div>
        </div>

        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#4a5547",
            marginBottom: 6,
          }}
        >
          Email
        </label>
        <div
          style={{
            padding: "10px 14px",
            background: "#faf6ee",
            border: "1px solid rgba(31, 42, 28, 0.08)",
            borderRadius: 8,
            fontSize: 14,
            color: "#7a857a",
            marginBottom: 18,
          }}
        >
          {OIT_OWNER_EMAIL}
        </div>

        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#4a5547",
            marginBottom: 6,
          }}
        >
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            background: "#fff",
            border: "1.5px solid rgba(31, 42, 28, 0.20)",
            borderRadius: 8,
            fontSize: 15,
            color: "#1f2a1c",
            marginBottom: 20,
            outline: "none",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(45, 74, 45, 0.55)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "rgba(31, 42, 28, 0.20)")
          }
        />

        {error && (
          <div
            style={{
              fontSize: 13,
              color: "#9d3030",
              background: "rgba(157, 48, 48, 0.08)",
              padding: "10px 12px",
              borderRadius: 6,
              marginBottom: 16,
              border: "1px solid rgba(157, 48, 48, 0.20)",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: "100%",
            padding: "14px",
            background: busy
              ? "#5a6e5a"
              : "linear-gradient(180deg, #2d4a2d 0%, #1d331d 100%)",
            color: "#faf6ee",
            border: "none",
            borderRadius: 8,
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.04em",
            cursor: busy ? "wait" : "pointer",
            boxShadow:
              "0 6px 14px -4px rgba(45, 74, 45, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
          }}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
