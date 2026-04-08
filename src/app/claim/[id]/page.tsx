"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const prospectId = params.id as string;
  const [info, setInfo] = useState<ProspectInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle payment=cancelled query param
  const paymentCancelled = searchParams.get("payment") === "cancelled";

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

        if (paymentCancelled) {
          // Prospect cancelled checkout — show a friendly message
          setMessages([
            {
              role: "agent",
              text: `Welcome back! Looks like you didn't finish checking out. No worries at all — your custom website for ${data.businessName} is still reserved.`,
            },
            {
              role: "agent",
              text: `Whenever you're ready, just let me know and I can take you back to the payment page. Or if you have any questions, I'm happy to help!`,
            },
          ]);
        } else {
          setMessages([
            {
              role: "agent",
              text: `Hey there! Welcome — I'm the BlueJays assistant. I see you're here about the website we built for ${data.businessName}. Pretty cool, right?`,
            },
            {
              role: "agent",
              text: `Before we get into details, have you had a chance to check out your preview site yet?`,
            },
          ]);
        }
      })
      .catch(() => {
        setMessages([
          {
            role: "agent",
            text: "Hey! Welcome to BlueJays. Looks like I'm having trouble loading your info. Could you tell me your business name?",
          },
        ]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Redirect the prospect to Stripe Checkout.
   */
  const redirectToCheckout = async () => {
    setIsRedirecting(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "agent",
        text: "Taking you to our secure checkout page now...",
      },
    ]);

    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            text: "Hmm, something went wrong setting up checkout. Let me try again — or you can reach out to us directly at bluejaycontactme@gmail.com.",
          },
        ]);
        setIsRedirecting(false);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "Sorry, I had trouble connecting to our payment system. Please try again in a moment or contact us at bluejaycontactme@gmail.com.",
        },
      ]);
      setIsRedirecting(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isRedirecting) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    // Simple conversation flow
    setTimeout(() => {
      const result = getNextResponse(step, userMsg, info?.businessName || "your business");
      setMessages((prev) => [
        ...prev,
        ...result.responses.map((text) => ({ role: "agent" as const, text })),
      ]);
      setStep((s) => s + 1);

      // If the response triggers checkout, redirect after a brief delay
      if (result.triggerCheckout) {
        setTimeout(() => redirectToCheckout(), 1500);
      }
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
          <div className="max-w-2xl mx-auto px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-sm font-medium text-blue-electric block">
                Your custom website is ready.
              </span>
              <span className="text-xs text-muted">
                You can preview it first or claim and pay right away.
              </span>
            </div>
            <div className="flex gap-2">
              <a
                href={info.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-4 py-1.5 rounded-full bg-blue-electric text-white font-medium hover:bg-blue-deep transition-colors"
              >
                View Preview
              </a>
              <button
                onClick={redirectToCheckout}
                disabled={isRedirecting}
                className="text-sm px-4 py-1.5 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isRedirecting ? "Redirecting..." : "Claim & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Cancelled Banner */}
      {paymentCancelled && (
        <div className="bg-amber-500/10 border-b border-amber-500/20">
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
            <span className="text-sm text-amber-400">
              Checkout was cancelled — your site is still reserved
            </span>
            <button
              onClick={redirectToCheckout}
              disabled={isRedirecting}
              className="text-sm px-4 py-1.5 rounded-full bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isRedirecting ? "Redirecting..." : "Try Again"}
            </button>
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
      {step === 0 && !paymentCancelled && (
        <div className="border-t border-border bg-surface">
          <div className="max-w-2xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
            {["Yes, I love it!", "I have some questions", "How much does this cost?", "Not interested"].map(
              (option) => (
                <button
                  key={option}
                  disabled={isRedirecting}
                  onClick={() => {
                    setInput(option);
                    setTimeout(() => {
                      setMessages((prev) => [
                        ...prev,
                        { role: "user", text: option },
                      ]);
                      const result = getNextResponse(0, option, info?.businessName || "your business");
                      setTimeout(() => {
                        setMessages((prev) => [
                          ...prev,
                          ...result.responses.map((text) => ({
                            role: "agent" as const,
                            text,
                          })),
                        ]);
                        setStep(1);

                        if (result.triggerCheckout) {
                          setTimeout(() => redirectToCheckout(), 1500);
                        }
                      }, 800);
                    }, 100);
                  }}
                  className="shrink-0 px-4 py-2 rounded-full bg-surface-light border border-border text-sm text-muted hover:text-foreground hover:border-blue-electric/40 transition-colors disabled:opacity-50"
                >
                  {option}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Claim CTA */}
      <div className="border-t border-border bg-surface">
        <div className="max-w-2xl mx-auto px-6 py-3 flex gap-2">
          <button
            onClick={redirectToCheckout}
            disabled={isRedirecting}
            className="flex-1 h-11 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isRedirecting ? "Redirecting to checkout..." : "Claim & Pay — $997"}
          </button>
        </div>
      </div>

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
              disabled={isRedirecting}
              className="flex-1 h-11 px-4 rounded-xl bg-surface-light border border-border text-foreground text-sm placeholder:text-muted/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isRedirecting}
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

interface ResponseResult {
  responses: string[];
  triggerCheckout: boolean;
}

function getNextResponse(step: number, userMessage: string, businessName: string): ResponseResult {
  const lower = userMessage.toLowerCase();

  // Ready to claim / proceed signals
  if (
    lower.includes("ready") ||
    lower.includes("claim") ||
    lower.includes("get started") ||
    lower.includes("let's do it") ||
    lower.includes("sign up") ||
    lower.includes("proceed") ||
    lower.includes("move forward") ||
    lower.includes("try again")
  ) {
    return {
      responses: [
        `Let's do it! I'll take you to our secure checkout page now. You'll be set up in just a couple minutes.`,
      ],
      triggerCheckout: true,
    };
  }

  // Interest signals
  if (lower.includes("love") || lower.includes("amazing") || lower.includes("great") || lower.includes("yes")) {
    return {
      responses: [
        `Awesome, so glad you like it! The site is fully custom — built specifically for ${businessName}.`,
        `Here's what's included: custom design, mobile optimization, SEO setup, hosting, and a year of site management. We handle everything so you can focus on running your business.`,
        `The total is $997 one-time for the site, plus $100/year for hosting and management. Ready to claim it? Just click the button below!`,
      ],
      triggerCheckout: false,
    };
  }

  // Price questions
  if (lower.includes("cost") || lower.includes("price") || lower.includes("how much") || lower.includes("pricing")) {
    return {
      responses: [
        `Great question! The website is a one-time investment of $997 — that includes everything: design, development, content, SEO, hosting setup, and your first year of site management.`,
        `After the first year, it's just $100/year to keep everything running, updated, and secure. No hidden fees, no contracts.`,
        `For comparison, most agencies charge $3,000-$10,000 for a site like this. $997 is firm — it's already the lowest we can go for this level of quality. We're able to offer it at this price because of our streamlined process. Would you like to move forward?`,
      ],
      triggerCheckout: false,
    };
  }

  // Questions
  if (lower.includes("question") || lower.includes("wondering") || lower.includes("curious")) {
    return {
      responses: [
        `Of course! I'm here to help. What would you like to know? Common questions I get:`,
        `- Can I make changes to the design?\n- What's included in the price?\n- How long until it's live?\n- Do I own the website?\n- What about hosting and domain?\n\nFeel free to ask anything!`,
      ],
      triggerCheckout: false,
    };
  }

  // Not interested
  if (lower.includes("not interested") || lower.includes("no thanks") || lower.includes("pass")) {
    return {
      responses: [
        `No worries at all! The preview site will stay up for a while if you change your mind. We work with a lot of ${businessName.includes(" ") ? "businesses in your industry" : "local businesses"} so we know the value a strong web presence brings.`,
        `If you ever want to revisit, just come back to this page or reply to our email. Wishing you all the best!`,
      ],
      triggerCheckout: false,
    };
  }

  // Changes/customization
  if (lower.includes("change") || lower.includes("custom") || lower.includes("modify") || lower.includes("different")) {
    return {
      responses: [
        `Absolutely! The preview site is just a starting point. Once you claim it, we'll customize everything — colors, content, photos, layout — whatever you need.`,
        `After you're set up, you'll fill out a quick form where you can tell us exactly what you want changed. Most customizations are included in the price. Want to get started?`,
      ],
      triggerCheckout: false,
    };
  }

  // Domain questions
  if (lower.includes("domain") || lower.includes("hosting") || lower.includes("url")) {
    return {
      responses: [
        `We handle all the technical stuff! If you already have a domain (like yourbusiness.com), we'll connect the new site to it. If you don't have one yet, we'll help you get one set up.`,
        `Hosting is included — your site will be fast, secure, and always online. No extra costs for hosting or SSL certificates.`,
      ],
      triggerCheckout: false,
    };
  }

  // Default / general
  if (step <= 1) {
    return {
      responses: [
        `Thanks for your interest! The website we built for ${businessName} is ready to go live whenever you are.`,
        `Would you like to know more about what's included, the pricing, or are you ready to claim your site?`,
      ],
      triggerCheckout: false,
    };
  }

  return {
    responses: [
      `Thanks for sharing that! Is there anything specific about the website or the process you'd like to know more about? I'm here to help with any questions.`,
    ],
    triggerCheckout: false,
  };
}
