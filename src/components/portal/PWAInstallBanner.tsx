"use client";

import { useEffect, useState } from "react";

/**
 * PWA install + service-worker registration for /clients/[slug]/portal.
 *
 * Mounts ONCE at the top of the portal. Three jobs:
 *   1. Registers /sw.js (idempotent — won't re-register if already active)
 *   2. Injects <link rel="manifest" href="/clients/[slug]/portal/manifest.json">
 *      and the theme-color meta so Add-to-Home-Screen picks up the right
 *      app name + colors.
 *   3. Shows a discreet install banner on Chrome/Edge/Android when the
 *      browser fires `beforeinstallprompt`. iOS Safari has no event —
 *      we render an iOS-specific hint instead.
 *
 * Designed to feel like a portal feature, not a popup. Dismissable.
 * Per CLAUDE.md "Mobile-First Portal Rules" (locked 2026-05-18).
 */

const DISMISS_KEY = "bj-pwa-banner-dismissed-2026-05";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS-specific
  if ((window.navigator as unknown as { standalone?: boolean }).standalone)
    return true;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export default function PWAInstallBanner({ slug }: { slug: string }) {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(false);

  // Inject <link rel="manifest"> + register service worker on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Link the manifest.
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = `/clients/${slug}/portal/manifest.json`;

    // Theme color meta (matches manifest's #0ea5e9 sky-500).
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = "#0ea5e9";

    // Register service worker.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.warn("[pwa] sw registration failed:", err));
    }

    setInstalled(isStandalone());
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");

    // Chrome/Edge/Android: capture the install event so we can fire it
    // on user gesture (browsers reject prompts outside one).
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS Safari: no event, but we can show a hint that explains how.
    if (isIOSSafari() && !isStandalone()) {
      setShowIosHint(true);
    }

    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [slug]);

  function dismiss() {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  }

  if (installed || dismissed) return null;
  if (!installEvent && !showIosHint) return null;

  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 px-4 py-3 mb-4 flex items-start gap-3">
      <span className="text-2xl shrink-0" aria-hidden>📱</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-sky-100">
          Add to your home screen
        </p>
        <p className="text-xs text-sky-200/70 mt-0.5 leading-relaxed">
          {installEvent
            ? "One tap to install. Opens like an app — no browser chrome, faster load."
            : "Tap the Share button in Safari, then 'Add to Home Screen'. Opens like an app — no browser chrome."}
        </p>
      </div>
      {installEvent ? (
        <button
          onClick={install}
          className="text-xs font-bold bg-sky-500 hover:bg-sky-400 text-sky-950 px-3 py-1.5 rounded shrink-0"
        >
          Install
        </button>
      ) : null}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-sky-300/60 hover:text-sky-100 text-lg leading-none shrink-0"
      >
        ×
      </button>
    </div>
  );
}
