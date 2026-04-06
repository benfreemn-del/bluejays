"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TemplateLayoutProps {
  businessName: string;
  tagline: string;
  accentColor: string;
  accentColorLight: string;
  heroGradient: string;
  phone: string;
  address: string;
  children: ReactNode;
}

export default function TemplateLayout({
  businessName,
  tagline,
  accentColor,
  heroGradient,
  phone,
  address,
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
      <section id="contact" className="py-24 bg-surface">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get in Touch
            </h2>
            <p className="text-muted text-lg">
              Ready to get started? Reach out today for a free consultation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl bg-surface-light border border-border">
              <div className="text-2xl mb-3">📞</div>
              <p className="font-semibold mb-1">Phone</p>
              <p className="text-muted">{phone}</p>
            </div>
            <div className="p-6 rounded-xl bg-surface-light border border-border">
              <div className="text-2xl mb-3">📍</div>
              <p className="font-semibold mb-1">Location</p>
              <p className="text-muted">{address}</p>
            </div>
            <div className="p-6 rounded-xl bg-surface-light border border-border">
              <div className="text-2xl mb-3">🕐</div>
              <p className="font-semibold mb-1">Hours</p>
              <p className="text-muted">Mon-Fri 8am-6pm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold">{businessName}</span>
          <p className="text-muted text-sm">
            &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
