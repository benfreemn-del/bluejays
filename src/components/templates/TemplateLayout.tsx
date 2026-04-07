"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import BluejayLogo from "../BluejayLogo";

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
  children,
}: TemplateLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold">{businessName}</span>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
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
            <a
              href={`tel:${phone}`}
              className="h-14 px-8 rounded-full border-2 border-white/30 text-white font-semibold text-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              Call {phone}
            </a>
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
                <p className="text-muted">{phone}</p>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-border relative overflow-hidden" style={{ background: `${accentColor}08` }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ background: `radial-gradient(circle at 50% 30%, ${accentColor}, transparent 70%)` }} />
              <div className="relative z-10">
                <div className="text-2xl mb-3">📍</div>
                <p className="font-semibold mb-1">Location</p>
                <p className="text-muted">{address}</p>
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
      <footer className="border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold">{businessName}</span>
          <p className="text-muted text-sm">
            &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
        </div>
        {/* Bluejay Branding */}
        <div className="border-t border-border/50 py-4">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-2">
            <BluejayLogo size={16} className="text-blue-electric/60" />
            <p className="text-muted/40 text-xs">
              Website created by Bluejay Business Solutions
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Claim Banner — only on preview sites */}
      {prospectId && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          {/* Social proof ticker */}
          <div className="bg-background/90 backdrop-blur-sm border-t border-border px-4 py-2 text-center">
            <p className="text-xs text-muted">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              47 businesses in your area upgraded their website this month
            </p>
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
      )}
    </div>
  );
}
