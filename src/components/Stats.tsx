"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

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
    <section className="py-24 bg-surface">
      <div className="max-w-5xl mx-auto px-6">
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
