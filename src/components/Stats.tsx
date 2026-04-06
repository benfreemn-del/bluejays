"use client";

import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import BluejayLogo from "./BluejayLogo";

interface CounterProps {
  target: number;
  suffix?: string;
  label: string;
}

function Counter({ target, suffix = "", label }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-bold text-blue-electric">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="text-muted mt-2 text-sm uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

export default function Stats() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #081424 0%, #0c2040 50%, #081424 100%)" }}>
      {/* Background art */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-blue-electric/6 blur-[180px]" />
        <BluejayLogo size={250} className="absolute top-[5%] left-[50%] -translate-x-1/2 opacity-[0.03] text-blue-electric" />
        {/* Animated-looking dots */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-electric"
            style={{
              left: `${10 + (i * 4.2) % 80}%`,
              top: `${15 + (i * 7.3) % 70}%`,
              opacity: 0.06 + (i % 5) * 0.02,
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Results that speak for themselves
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Counter target={150} suffix="+" label="Websites Built" />
          <Counter target={30} label="Industries Served" />
          <Counter target={2} suffix="M+" label="Impressions Generated" />
          <Counter target={98} suffix="%" label="Client Satisfaction" />
        </div>
      </div>
    </section>
  );
}
