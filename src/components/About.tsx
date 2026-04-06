"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-blue-electric text-sm font-semibold uppercase tracking-wider mb-4">
              About BlueJays
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your business deserves a website that works as hard as you do
            </h2>
            <p className="text-muted leading-relaxed mb-4">
              Most local businesses either have an outdated website or no site at
              all. We change that. BlueJays builds premium, modern websites
              tailored to your industry — and we show you the finished product
              before you pay a dime.
            </p>
            <p className="text-muted leading-relaxed">
              No templates that look like everyone else. No hidden fees. No
              waiting months. Just a stunning website that brings in customers,
              delivered fast.
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                className="flex gap-4"
              >
                <div className="shrink-0 w-12 h-12 rounded-lg bg-blue-electric/10 flex items-center justify-center text-blue-electric text-xl">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: "\u26A1",
    title: "Built in Days, Not Months",
    description:
      "Our AI-powered process delivers a polished site faster than any traditional agency.",
  },
  {
    icon: "\uD83C\uDFA8",
    title: "Industry-Specific Design",
    description:
      "Every site is crafted for your specific industry with sections that actually matter to your customers.",
  },
  {
    icon: "\uD83D\uDCF1",
    title: "Mobile-First & Fast",
    description:
      "Every site scores 90+ on Google PageSpeed. Your customers find you on their phones — we make sure it looks perfect.",
  },
  {
    icon: "\uD83D\uDD12",
    title: "See It Before You Pay",
    description:
      "We build your site first and show you a live preview. Only pay if you love it.",
  },
];
