"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface WelcomeData {
  businessName: string;
  previewUrl: string;
  onboardingUrl: string;
}

export default function WelcomePage() {
  const params = useParams();
  const prospectId = params.id as string;
  const [data, setData] = useState<WelcomeData | null>(null);

  useEffect(() => {
    // Public endpoint — paying customers land here from the Stripe success URL
    // without an auth cookie. /api/prospects/[id] is admin-protected and would
    // 401 silently. Per CLAUDE.md "Public-Facing Surface Rules" use the
    // whitelisted claim endpoint instead.
    fetch(`/api/claim/${prospectId}`)
      .then((r) => r.json())
      .then((prospect) => {
        if (!prospect.error) {
          setData({
            businessName: prospect.businessName,
            // Trust generatedSiteUrl from the claim API. If absent we show
            // "Site loading…" instead of a broken /preview/[uuid] long URL
            // that would 401 for unauthenticated customers anyway (Rule 1).
            previewUrl: prospect.generatedSiteUrl || "",
            onboardingUrl: `/onboarding/${prospectId}`,
          });
        }
      })
      .catch(() => {});
  }, [prospectId]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-electric/20 to-background pt-16 pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep mx-auto mb-8 flex items-center justify-center">
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to BlueJays!
          </h1>
          <p className="text-xl text-muted">
            Thank you for choosing us, {data.businessName}. Here&apos;s
            everything you need to get started.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto px-6 -mt-8 space-y-6">
        <Step
          number={1}
          title="Your Website Preview"
          description="Your custom website is already built and waiting for you. Click below to see it live."
          action={
            <a
              href={data.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 px-6 rounded-xl bg-blue-electric text-white text-sm font-medium items-center hover:bg-blue-deep transition-colors"
            >
              View Your Website
            </a>
          }
        />

        <Step
          number={2}
          title="Complete Your Onboarding Form"
          description="Tell us about your business so we can customize your site with your branding, services, and content."
          action={
            <a
              href={data.onboardingUrl}
              className="inline-flex h-11 px-6 rounded-xl bg-surface border border-border text-foreground text-sm font-medium items-center hover:border-blue-electric/40 transition-colors"
            >
              Fill Out Onboarding Form
            </a>
          }
        />

        <Step
          number={3}
          title="We Customize Your Site"
          description="Our team takes your onboarding info and customizes every detail — colors, content, photos, and domain. This usually takes 24-48 hours."
          badge="We handle this"
        />

        <Step
          number={4}
          title="Final Review"
          description="We'll send you a preview of the customized site. You can request unlimited tweaks until you're 100% happy. Just reply to your welcome email or text Ben directly."
          action={
            <a
              href="mailto:bluejaycontactme@gmail.com?subject=Request%20changes%20to%20my%20site"
              className="inline-flex h-11 px-6 rounded-xl bg-surface border border-border text-foreground text-sm font-medium items-center hover:border-blue-electric/40 transition-colors"
            >
              Email Changes to Ben
            </a>
          }
        />

        <Step
          number={5}
          title="Your Site Goes Live!"
          description="Once you approve the final version, we connect your domain and launch. Your new website is live for the world to see."
          badge="Usually within 48 hours"
        />
      </div>

      {/* What's Included */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">
          What&apos;s Included
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            "Custom website design",
            "Mobile-responsive layout",
            "SEO optimization",
            "Contact forms",
            "Domain registration",
            "Hosting setup & SSL",
            "Unlimited revisions",
            "Google Analytics setup",
            "Social media integration",
            "Speed optimization",
            "Security monitoring",
            "Email + text support",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <span className="text-blue-electric">✓</span>
              <span className="text-muted">{item}</span>
            </div>
          ))}
        </div>

        {/* Year-2 billing transparency — CLAUDE.md "Pricing Wording
            Consistency Rule" requires every paid-customer surface to
            disclose the renewal cadence. */}
        <div className="mt-8 p-6 rounded-2xl bg-surface border border-border">
          <h3 className="text-sm font-bold mb-2">Your billing — clear and simple</h3>
          <p className="text-muted text-xs leading-relaxed">
            Today&apos;s payment covers your custom website design, domain
            registration, and hosting setup. Starting year 2, $100/year covers
            domain renewal, hosting, ongoing maintenance, and support. Cancel
            anytime — you keep the site and the domain transfers to you.
          </p>
        </div>
      </div>

      {/* Support */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="p-8 rounded-2xl bg-surface border border-border text-center">
          <h3 className="text-lg font-bold mb-2">Need Help?</h3>
          <p className="text-muted text-sm mb-4">
            We&apos;re here for you every step of the way.
          </p>
          <a
            href="mailto:bluejaycontactme@gmail.com"
            className="inline-flex h-11 px-6 rounded-xl bg-blue-electric text-white text-sm font-medium items-center"
          >
            Email Us: bluejaycontactme@gmail.com
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <span className="font-bold">BlueJays</span>
          </div>
          <p className="text-muted text-xs">
            &copy; {new Date().getFullYear()} BlueJays. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  action,
  badge,
}: {
  number: number;
  title: string;
  description: string;
  action?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="flex gap-4 p-6 rounded-2xl bg-surface border border-border">
      <div className="shrink-0 w-10 h-10 rounded-full bg-blue-electric/10 text-blue-electric font-bold flex items-center justify-center">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-muted text-sm mb-3">{description}</p>
        {action}
        {badge && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-electric/10 text-blue-electric text-xs font-medium">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
