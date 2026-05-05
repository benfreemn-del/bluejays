"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * KR Ranches admin login. Owner reaches this page by clicking the BlueJay
 * feather icon in the static-site footer. Single password field — the
 * email is fixed on the server side via the slug + the existing client_owners
 * row (owner enters password only).
 *
 * Reuses the existing /api/client-portal/login endpoint (multi-tenant cookie
 * auth from src/lib/client-auth.ts) — but the form here only collects the
 * password and ships a fixed email under the hood. The owner email is
 * displayed greyed-out for transparency.
 */

const KR_OWNER_EMAIL = "krranchesllc@gmail.com";
const SLUG = "kr-ranches";

export default function KRLoginPage() {
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
          email: KR_OWNER_EMAIL,
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
      router.push("/clients/kr-ranches/admin");
    } catch (err) {
      setError("Network error — please try again");
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #faf6ee 0%, #f1ebdd 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        color: "#1f1a14",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 12,
          padding: 36,
          boxShadow:
            "0 24px 48px -16px rgba(31, 26, 20, 0.18), 0 6px 14px -8px rgba(139, 30, 30, 0.10)",
          border: "1px solid rgba(139, 30, 30, 0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              fontFamily: "Impact, 'Bebas Neue', sans-serif",
              fontSize: 32,
              letterSpacing: "0.06em",
              color: "#1f1a14",
            }}
          >
            KR RANCHES
          </div>
          <div
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 14,
              color: "#7a6f60",
              fontStyle: "italic",
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
            color: "#4a4035",
            marginBottom: 6,
          }}
        >
          Email
        </label>
        <div
          style={{
            padding: "10px 14px",
            background: "#f8f4ee",
            border: "1px solid rgba(31, 26, 20, 0.08)",
            borderRadius: 8,
            fontSize: 15,
            color: "#7a6f60",
            marginBottom: 20,
          }}
        >
          {KR_OWNER_EMAIL}
        </div>

        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#4a4035",
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
            border: "1px solid rgba(31, 26, 20, 0.20)",
            borderRadius: 8,
            fontSize: 15,
            color: "#1f1a14",
            marginBottom: 20,
            outline: "none",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(139, 30, 30, 0.5)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "rgba(31, 26, 20, 0.20)")
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
              ? "#a04444"
              : "linear-gradient(180deg, #a02525 0%, #6b1414 100%)",
            color: "#f5e8c8",
            border: "2px solid #4a0c0c",
            borderRadius: 6,
            fontFamily: "Impact, sans-serif",
            fontSize: 15,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            cursor: busy ? "wait" : "pointer",
            boxShadow:
              "0 6px 14px -4px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          }}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px dashed rgba(31, 26, 20, 0.15)",
            fontSize: 12,
            color: "#7a6f60",
            textAlign: "center",
            lineHeight: 1.55,
          }}
        >
          Forgot the password? Email Ben at{" "}
          <a
            href="mailto:bluejaycontactme@gmail.com"
            style={{ color: "#9d3030", textDecoration: "none" }}
          >
            bluejaycontactme@gmail.com
          </a>
        </div>
      </form>
    </div>
  );
}
