"use client";

import { useEffect, useRef, ReactNode } from "react";

export default function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?: "up" | "left" | "right";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cls = variant === "left" ? "reveal-left" : variant === "right" ? "reveal-right" : "reveal";
    el.classList.add(cls);
    if (delay) el.style.transitionDelay = `${delay}ms`;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [variant, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
