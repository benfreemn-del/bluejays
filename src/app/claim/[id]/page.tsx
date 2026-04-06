"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

interface ProspectInfo {
  businessName: string;
  category: string;
  previewUrl: string;
  accentColor: string;
}

interface Message {
  role: "agent" | "user";
  text: string;
}

export default function ClaimPage() {
  const params = useParams();
  const prospectId = params.id as string;
  const [info, setInfo] = useState<ProspectInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/prospects/${prospectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setInfo({
          businessName: data.businessName,
          category: data.category,
          previewUrl: data.generatedSiteUrl || `/preview/${prospectId}`,
          accentColor: "#0ea5e9",
        });
        setMessages([
          {
            role: "agent",
            text: `Hey there! 👋 Welcome — I'm the BlueJays assistant. I see you're here about the website we built for ${data.businessName}. Pretty cool, right?`,
          },
          {
            role: "agent",
            text: `Before we get into details, have you had a chance to check out your preview site yet?`,
          },
        ]);
      })
      .catch(() => {
        setMessages([
          {
            role: "agent",
            text: "Hey! 👋 Welcome to BlueJays. Looks like I'm having trouble loading your info. Could you tell me your business name?",
          },
        ]);
      });
  }, [prospectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    // Simple conversation flow
    setTimeout(() => {
      const responses = getNextResponse(step, userMsg, info?.businessName || "your business");
      setMessages((prev) => [...prev, ...responses.map((text) => ({ role: "agent" as const, text }))]);
      setStep((s) => s + 1);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
          <span className="font-bold text-lg">BlueJays</span>
          {info && (
            <span className="text-muted text-sm ml-auto">
              {info.businessName}
            </span>
          )}
        </div>
      </header>

      {/* Preview Banner */}
      {info?.previewUrl && (
        <div className="bg-blue-electric/10 border-b border-blue-electric/20">
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
            <span className="text-sm text-blue-electric">
              Your custom website is ready!
            </span>
            <a
              href={info.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-1.5 rounded-full bg-blue-electric text-white font-medium hover:bg-blue-deep transition-colors"
            >
              View Preview
            </a>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-electric text-white rounded-br-sm"
                    : "bg-surface border border-border rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {step === 0 && (
        <div className="border-t border-border bg-surface">
          <div className="max-w-2xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
            {["Yes, I love it!", "I have some questions", "How much does this cost?", "Not interested"].map(
              (option) => (
                <button
                  key={option}
                  onClick={() => {
                    setInput(option);
                    setTimeout(() => {
                      setMessages((prev) => [
                        ...prev,
                        { role: "user", text: option },
                      ]);
                      const responses = getNextResponse(0, option, info?.businessName || "your business");
                      setTimeout(() => {
                        setMessages((prev) => [
                          ...prev,
                          ...responses.map((text) => ({
                            role: "agent" as const,
                            text,
                          })),
                        ]);
                        setStep(1);
                      }, 800);
                    }, 100);
                  }}
                  className="shrink-0 px-4 py-2 rounded-full bg-surface-light border border-border text-sm text-muted hover:text-foreground hover:border-blue-electric/40 transition-colors"
                >
                  {option}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-surface">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-11 px-4 rounded-xl bg-surface-light border border-border text-foreground text-sm placeholder:text-muted/50"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-11 px-6 rounded-xl bg-blue-electric text-white text-sm font-medium disabled:opacity-30 hover:bg-blue-deep transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function getNextResponse(step: number, userMessage: string, businessName: string): string[] {
  const lower = userMessage.toLowerCase();

  // Interest signals
  if (lower.includes("love") || lower.includes("amazing") || lower.includes("great") || lower.includes("yes")) {
    return [
      `Awesome, so glad you like it! 🎉 The site is fully custom — built specifically for ${businessName}.`,
      `Here's what's included: custom design, mobile optimization, SEO setup, hosting, and a year of site management. We handle everything so you can focus on running your business.`,
      `If you're ready to claim it, I can get you set up in about 2 minutes. You'll get your site live on your own domain within 48 hours. Want to get started?`,
    ];
  }

  // Price questions
  if (lower.includes("cost") || lower.includes("price") || lower.includes("how much") || lower.includes("pricing")) {
    return [
      `Great question! The website is a one-time investment of $997 — that includes everything: design, development, content, SEO, hosting setup, and your first year of site management.`,
      `After the first year, it's just $100/year to keep everything running, updated, and secure. No hidden fees, no contracts.`,
      `For comparison, most agencies charge $3,000-$10,000 for a site like this. $997 is firm — it's already the lowest we can go for this level of quality for a site like this. We're able to offer it at this price because of our streamlined process. Would you like to move forward?`,
    ];
  }

  // Questions
  if (lower.includes("question") || lower.includes("wondering") || lower.includes("curious")) {
    return [
      `Of course! I'm here to help. What would you like to know? Common questions I get:`,
      `• Can I make changes to the design?\n• What's included in the price?\n• How long until it's live?\n• Do I own the website?\n• What about hosting and domain?\n\nFeel free to ask anything!`,
    ];
  }

  // Not interested
  if (lower.includes("not interested") || lower.includes("no thanks") || lower.includes("pass")) {
    return [
      `No worries at all! The preview site will stay up for a while if you change your mind. We work with a lot of ${businessName.includes(" ") ? "businesses in your industry" : "local businesses"} so we know the value a strong web presence brings.`,
      `If you ever want to revisit, just come back to this page or reply to our email. Wishing you all the best! 🙌`,
    ];
  }

  // Changes/customization
  if (lower.includes("change") || lower.includes("custom") || lower.includes("modify") || lower.includes("different")) {
    return [
      `Absolutely! The preview site is just a starting point. Once you claim it, we'll customize everything — colors, content, photos, layout — whatever you need.`,
      `After you're set up, you'll fill out a quick form where you can tell us exactly what you want changed. Most customizations are included in the price. Want to get started?`,
    ];
  }

  // Domain questions
  if (lower.includes("domain") || lower.includes("hosting") || lower.includes("url")) {
    return [
      `We handle all the technical stuff! If you already have a domain (like yourbusiness.com), we'll connect the new site to it. If you don't have one yet, we'll help you get one set up.`,
      `Hosting is included — your site will be fast, secure, and always online. No extra costs for hosting or SSL certificates.`,
    ];
  }

  // Default / general
  if (step <= 1) {
    return [
      `Thanks for your interest! The website we built for ${businessName} is ready to go live whenever you are.`,
      `Would you like to know more about what's included, the pricing, or are you ready to claim your site?`,
    ];
  }

  return [
    `Thanks for sharing that! Is there anything specific about the website or the process you'd like to know more about? I'm here to help with any questions.`,
  ];
}
