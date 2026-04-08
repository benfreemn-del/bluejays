"use client";

import DeliverabilityPanel from "@/components/DeliverabilityPanel";

export default function DeliverabilityPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <h1 className="text-xl font-bold">Email Deliverability</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
              Dashboard
            </a>
            <a href="/analytics" className="text-sm text-muted hover:text-foreground transition-colors">
              Analytics
            </a>
            <a href="/spending" className="text-sm text-muted hover:text-foreground transition-colors">
              Spending
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Deliverability Health Center</h2>
          <p className="text-muted text-sm">
            Monitor SPF/DKIM/DMARC authentication, warm-up progress, bounce rates, and overall email health.
          </p>
        </div>
        <DeliverabilityPanel />
      </main>
    </div>
  );
}
