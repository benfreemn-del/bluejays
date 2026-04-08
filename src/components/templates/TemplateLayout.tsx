"use client";

import { motion } from "framer-motion";
import React, { ReactNode, useState, useEffect } from "react";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  yelp?: string;
  youtube?: string;
  tiktok?: string;
}

interface TemplateLayoutProps {
  businessName: string;
  tagline: string;
  accentColor: string;
  accentColorLight: string;
  heroGradient: string;
  heroImage?: string;
  phone: string;
  address: string;
  prospectId?: string;
  socialLinks?: SocialLinks;
  themeMode?: "light" | "dark";
  children: ReactNode;
}

export default function TemplateLayout({
  businessName,
  tagline,
  accentColor,
  heroGradient,
  heroImage,
  phone,
  address,
  prospectId,
  socialLinks,
  themeMode,
  children,
}: TemplateLayoutProps) {
  const isLight = themeMode === "light";
  const bgClass = isLight ? "bg-white text-gray-900" : "bg-background text-foreground";
  const navBg = isLight ? "bg-white/80" : "bg-background/80";
  const mutedClass = isLight ? "text-gray-500" : "text-muted";
  const borderClass = isLight ? "border-gray-200" : "border-border";
  const footerBg = isLight ? "bg-gray-50" : "bg-background";
  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${navBg} backdrop-blur-md border-b ${borderClass}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold">{businessName}</span>
          <div className={`hidden md:flex items-center gap-8 text-sm ${mutedClass}`}>
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <a
            href="#contact"
            className="h-10 px-5 rounded-full text-white text-sm font-semibold flex items-center"
            style={{ background: accentColor }}
          >
            Get in Touch
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center pt-16"
        style={{ background: heroGradient }}
      >
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            {businessName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 mb-8"
          >
            {tagline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="#contact"
              className="h-14 px-8 rounded-full text-white font-semibold text-lg flex items-center justify-center"
              style={{ background: accentColor }}
            >
              Get a Free Quote
            </a>
            <PhoneLink
              phone={phone}
              className="h-14 px-8 rounded-full border-2 border-white/30 text-white font-semibold text-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              Call {phone}
            </PhoneLink>
          </motion.div>
        </div>
      </section>

      {/* Page content (services, about, testimonials) */}
      {children}

      {/* Contact Section */}
      <section id="contact" className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${accentColor}08 0%, ${accentColor}04 50%, transparent 100%)` }}>
        {/* Background art */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[150px]"
            style={{ background: `${accentColor}0a` }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="80" stroke={accentColor} strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="150" stroke={accentColor} strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="220" stroke={accentColor} strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get in Touch
            </h2>
            <p className="text-muted text-lg">
              Ready to get started? Reach out today for a free consultation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl border border-border relative overflow-hidden" style={{ background: `${accentColor}08` }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ background: `radial-gradient(circle at 50% 30%, ${accentColor}, transparent 70%)` }} />
              <div className="relative z-10">
                <div className="text-2xl mb-3">📞</div>
                <p className="font-semibold mb-1">Phone</p>
                <PhoneLink phone={phone} className="text-muted" />
              </div>
            </div>
            <div className="p-6 rounded-xl border border-border relative overflow-hidden" style={{ background: `${accentColor}08` }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ background: `radial-gradient(circle at 50% 30%, ${accentColor}, transparent 70%)` }} />
              <div className="relative z-10">
                <div className="text-2xl mb-3">📍</div>
                <p className="font-semibold mb-1">Location</p>
                <MapLink address={address} className="text-muted" />
              </div>
            </div>
            <div className="p-6 rounded-xl border border-border relative overflow-hidden" style={{ background: `${accentColor}08` }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ background: `radial-gradient(circle at 50% 30%, ${accentColor}, transparent 70%)` }} />
              <div className="relative z-10">
                <div className="text-2xl mb-3">🕐</div>
                <p className="font-semibold mb-1">Hours</p>
                <p className="text-muted">Mon-Fri 8am-6pm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${borderClass} ${footerBg}`}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Business info */}
            <div>
              <span className="font-bold text-lg">{businessName}</span>
              <MapLink address={address} className="text-muted text-sm mt-2 block" />
              <PhoneLink phone={phone} className="text-muted text-sm" />
            </div>
            {/* Quick links */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-3" style={{ color: accentColor }}>Quick Links</h4>
              <div className="space-y-2 text-sm text-muted">
                <a href="#services" className="block hover:text-foreground transition-colors">Services</a>
                <a href="#about" className="block hover:text-foreground transition-colors">About</a>
                <a href="#testimonials" className="block hover:text-foreground transition-colors">Testimonials</a>
                <a href="#contact" className="block hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>
            {/* Social media */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-3" style={{ color: accentColor }}>Follow Us</h4>
              <div className="flex items-center gap-3">
                {(!socialLinks || Object.keys(socialLinks).length === 0) ? (
                  <>
                    <SocialIcon platform="facebook" href="#" color={accentColor} />
                    <SocialIcon platform="instagram" href="#" color={accentColor} />
                    <SocialIcon platform="yelp" href="#" color={accentColor} />
                  </>
                ) : (
                  <>
                    {socialLinks.facebook && <SocialIcon platform="facebook" href={socialLinks.facebook} color={accentColor} />}
                    {socialLinks.instagram && <SocialIcon platform="instagram" href={socialLinks.instagram} color={accentColor} />}
                    {socialLinks.twitter && <SocialIcon platform="twitter" href={socialLinks.twitter} color={accentColor} />}
                    {socialLinks.linkedin && <SocialIcon platform="linkedin" href={socialLinks.linkedin} color={accentColor} />}
                    {socialLinks.yelp && <SocialIcon platform="yelp" href={socialLinks.yelp} color={accentColor} />}
                    {socialLinks.youtube && <SocialIcon platform="youtube" href={socialLinks.youtube} color={accentColor} />}
                    {socialLinks.tiktok && <SocialIcon platform="tiktok" href={socialLinks.tiktok} color={accentColor} />}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted text-sm">
              &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
            </p>
          </div>
        </div>
        {/* Bluejay Branding */}
        <div className="border-t border-border/50 py-4">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-2">
            <BluejayLogo size={16} className="text-blue-electric/60" />
            <p className="text-muted/40 text-xs">
              Created by{" "}
              <a
                href="https://bluejayportfolio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-electric/80 transition-colors underline underline-offset-2"
              >
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Claim Banner — only on preview sites */}
      {prospectId && <ClaimBanner businessName={businessName} accentColor={accentColor} prospectId={prospectId} />}
    </div>
  );
}

function ClaimBanner({ businessName, accentColor, prospectId }: { businessName: string; accentColor: string; prospectId: string }) {
  // Countdown: 7 days from now (resets each visit, creates urgency)
  const [timeLeft, setTimeLeft] = useState("");
  const [showDisclosure, setShowDisclosure] = useState(true);

  useEffect(() => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    const tick = () => {
      const diff = expiry.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("EXPIRED"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Placeholder content disclosure — per proposal refinement 1.1 */}
      {showDisclosure && (
        <div className="bg-amber-500/10 border-t border-amber-500/30 px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs text-amber-200/80 flex-1">
            <span className="font-semibold text-amber-300">Preview Note:</span>{" "}
            This is your preview — after you claim it, we replace all placeholder text with content specific to your business. Colors, photos, layout, and copy are all fully customizable.
          </p>
          <button
            onClick={() => setShowDisclosure(false)}
            className="ml-3 text-amber-400/60 hover:text-amber-300 transition-colors text-xs"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Social proof ticker */}
      <div className="bg-background/90 backdrop-blur-sm border-t border-border px-4 py-2 flex items-center justify-center gap-4">
        <p className="text-xs text-muted">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
          Custom-built preview for this business
        </p>
        {timeLeft && timeLeft !== "EXPIRED" && (
          <p className="text-xs font-bold" style={{ color: accentColor }}>
            Preview expires in {timeLeft}
          </p>
        )}
      </div>
      {/* Claim CTA */}
      <div
        className="px-6 py-4 flex items-center justify-between gap-4"
        style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`, borderTop: `1px solid ${accentColor}30` }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            This website was built for {businessName}
          </p>
          <p className="text-xs text-muted">Claim it before we offer it to a competitor</p>
        </div>
        <a
          href={`/claim/${prospectId}`}
          className="shrink-0 h-11 px-6 rounded-full text-white text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-300"
          style={{ background: accentColor }}
        >
          Claim Your Website
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function SocialIcon({ platform, href, color }: { platform: string; href: string; color: string }) {
  const icons: Record<string, React.ReactNode> = {
    facebook: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
      </svg>
    ),
    yelp: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    ),
    youtube: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.12V9.02a6.32 6.32 0 0 0-.82-.05c-3.49 0-6.32 2.83-6.32 6.32 0 3.49 2.83 6.32 6.32 6.32 3.49 0 6.32-2.83 6.32-6.32V8.87a8.28 8.28 0 0 0 4.84 1.55V6.97a4.84 4.84 0 0 1-1.06-.28z" />
      </svg>
    ),
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{ borderColor: `${color}30`, color: `${color}90` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; e.currentTarget.style.backgroundColor = `${color}15`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.color = `${color}90`; e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      {icons[platform] || <span className="text-xs">{platform[0].toUpperCase()}</span>}
    </a>
  );
}
