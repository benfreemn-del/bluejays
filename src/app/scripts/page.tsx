"use client";

import { useState } from "react";

type Channel = "email" | "sms" | "call" | "instagram";

interface Script {
  title: string;
  channel: Channel;
  stage: string;
  content: string;
}

const scripts: Script[] = [
  // EMAIL SCRIPTS
  {
    title: "Initial Pitch Email",
    channel: "email",
    stage: "First Contact",
    content: `Subject: [Business Name] — I built you a new website (take a look)

Hi [First Name],

I came across [Business Name] and was impressed by what you've built. So I went ahead and did something a little different — I actually built you a brand new website. Completely free, no strings attached.

Here it is: [Preview Link]

It's modern, mobile-friendly, and designed specifically for [industry] businesses like yours. Take 30 seconds to check it out.

If you love it, we can have it live on your own domain within 48 hours. If not, no hard feelings at all.

Best,
The BlueJays Team`,
  },
  {
    title: "Follow-Up #1 (Day 3)",
    channel: "email",
    stage: "Follow-Up",
    content: `Subject: Quick follow-up — did you see your new site, [First Name]?

Hi [First Name],

Just wanted to make sure you had a chance to check out the website I built for [Business Name]:

[Preview Link]

I put a lot of thought into making it perfect for your business. Would love to hear your thoughts — even a quick "looks good" or "not interested" helps!

Best,
The BlueJays Team`,
  },
  {
    title: "Final Follow-Up (Day 7)",
    channel: "email",
    stage: "Last Touch",
    content: `Subject: Last chance — your custom [Business Name] website

Hi [First Name],

This is my last note about the website I built for [Business Name]:

[Preview Link]

I'm moving on to other businesses in your area soon. If you're interested, just reply and we'll get it set up. If not, no worries — wishing you all the best!

Best,
The BlueJays Team`,
  },

  // SMS SCRIPTS
  {
    title: "Initial Text",
    channel: "sms",
    stage: "First Contact",
    content: `Hey [First Name]! This is BlueJays. We built a free custom website for [Business Name] — check it out: [Preview Link] Let us know what you think!`,
  },
  {
    title: "Follow-Up Text (Day 3)",
    channel: "sms",
    stage: "Follow-Up",
    content: `Hi [First Name], just following up on the website we built for [Business Name]. Have you had a chance to look? [Preview Link]`,
  },
  {
    title: "Final Text (Day 7)",
    channel: "sms",
    stage: "Last Touch",
    content: `Last message from us [First Name] — your free [Business Name] website is still live at [Preview Link]. Claim it before we move on! No pressure either way.`,
  },

  // CALL SCRIPTS
  {
    title: "Cold Call — Opening",
    channel: "call",
    stage: "First Contact",
    content: `"Hey [First Name], this is [Your Name] from BlueJays. How's it going?

[Let them respond]

Listen, I'll keep this super quick — I know you're busy running [Business Name]. The reason I'm calling is actually kind of unusual. We specialize in building websites for [industry] businesses, and we were so impressed by your reputation that we actually went ahead and built you a brand new website. Completely free.

I'm not asking you to buy anything today. I literally just want to show you what we made. Can I text you the link real quick so you can check it out when you have a sec?"

KEY PRINCIPLES:
- Be genuinely enthusiastic, not salesy
- Let them know this is about GIVING, not selling
- If they say "not interested," say "Totally understand! The site's there if you change your mind. Have a great day!"
- Never argue or push back on objections`,
  },
  {
    title: "Call — They've Seen the Site",
    channel: "call",
    stage: "Follow-Up",
    content: `"Hey [First Name]! It's [Your Name] from BlueJays. I sent you that website we built — did you get a chance to check it out?

[If yes and they liked it]:
"Awesome! So glad you like it. The site is 100% ready to go live on your own domain. We handle everything — the setup, the hosting, the whole thing. It's a one-time investment of $997 — that's our standard rate and it's firm. After the first year, it's just $100/year for us to keep it running and updated. Want me to get you set up?"

[If they have questions]:
"Great question! [Answer honestly]. The bottom line is we built this specifically for businesses like yours. Everything is included — design, hosting, SEO, mobile optimization, the works."

[If they want to think about it]:
"Totally fair! Take your time. The preview link isn't going anywhere. I'll follow up in a couple days just to check in, cool?"

KEY: Always reference their specific business and what makes their site special. Make it personal.`,
  },

  // INSTAGRAM DM SCRIPTS
  {
    title: "Instagram DM — Initial",
    channel: "instagram",
    stage: "First Contact",
    content: `Hey [First Name]! I came across [Business Name] and [category-specific compliment]. I actually went ahead and built you a free website — no catch, just wanted to show you what's possible. Check it out: [Preview Link]`,
  },
  {
    title: "Instagram DM — Follow-Up",
    channel: "instagram",
    stage: "Follow-Up",
    content: `Hey [First Name], just following up — did you get a chance to check out that website I built for [Business Name]? Here's the link again: [Preview Link] Would love to hear your thoughts!`,
  },
];

const channelConfig: Record<Channel, { label: string; color: string; bg: string }> = {
  email: { label: "Email", color: "text-green-400", bg: "bg-green-500/10" },
  sms: { label: "SMS", color: "text-blue-400", bg: "bg-blue-500/10" },
  call: { label: "Phone Call", color: "text-orange-400", bg: "bg-orange-500/10" },
  instagram: { label: "Instagram", color: "text-purple-400", bg: "bg-purple-500/10" },
};

export default function ScriptsPage() {
  const [activeChannel, setActiveChannel] = useState<Channel | "all">("all");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const filtered = activeChannel === "all" ? scripts : scripts.filter((s) => s.channel === activeChannel);

  const copyScript = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <h1 className="text-xl font-bold">Sales Scripts & Training</h1>
          </div>
          <a href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
            Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Psychological Framework */}
        <div className="mb-10 p-6 rounded-2xl bg-surface border border-border">
          <h2 className="text-lg font-bold mb-4">Core Sales Framework</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-blue-electric mb-2">Principles</h3>
              <ul className="space-y-2 text-muted">
                <li><span className="text-foreground font-medium">Lead with value:</span> We already BUILT them something. This isn&apos;t a pitch — it&apos;s a gift.</li>
                <li><span className="text-foreground font-medium">Reciprocity:</span> When you give first, people naturally want to give back.</li>
                <li><span className="text-foreground font-medium">Social proof:</span> &ldquo;We&apos;ve built sites for 150+ businesses in your area.&rdquo;</li>
                <li><span className="text-foreground font-medium">Scarcity:</span> &ldquo;We&apos;re only working with a few businesses per county.&rdquo;</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-electric mb-2">Rules</h3>
              <ul className="space-y-2 text-muted">
                <li><span className="text-foreground font-medium">Never be pushy.</span> If they say no, respect it immediately.</li>
                <li><span className="text-foreground font-medium">Be genuinely kind.</span> These are real people running real businesses.</li>
                <li><span className="text-foreground font-medium">Reference prior contact.</span> Always check the comms log first.</li>
                <li><span className="text-foreground font-medium">Don&apos;t lead with price.</span> Let them fall in love with the site first.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Channel Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "email", "sms", "call", "instagram"] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeChannel === ch
                  ? "bg-blue-electric text-white"
                  : "bg-surface border border-border text-muted hover:text-foreground"
              }`}
            >
              {ch === "all" ? "All Channels" : channelConfig[ch].label}
            </button>
          ))}
        </div>

        {/* Scripts */}
        <div className="space-y-4">
          {filtered.map((script, i) => {
            const config = channelConfig[script.channel];
            return (
              <div key={i} className="p-6 rounded-xl bg-surface border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-muted">{script.stage}</span>
                  </div>
                  <button
                    onClick={() => copyScript(script.content, i)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      copiedIdx === i
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-electric/10 text-blue-electric hover:bg-blue-electric/20"
                    }`}
                  >
                    {copiedIdx === i ? "Copied!" : "Copy"}
                  </button>
                </div>
                <h3 className="font-semibold mb-3">{script.title}</h3>
                <pre className="text-sm text-muted whitespace-pre-wrap leading-relaxed font-sans">
                  {script.content}
                </pre>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
