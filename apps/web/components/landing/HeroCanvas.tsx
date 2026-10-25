"use client";

import { useEffect, useRef } from "react";

export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = ref.current;
    if (!canvasEl) return;
    const ctxEl = canvasEl.getContext("2d");
    if (!ctxEl) return;
    const c = canvasEl;
    const k = ctxEl;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; life: number; hue: number };
    const particles: Particle[] = [];

    function resize() {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      k.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn() {
      if (particles.length > 120) return;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 1.6 + 0.4,
        life: Math.random() * 60 + 40,
        hue: Math.random() > 0.5 ? 38 : 190, // amber or cyan
      });
    }

    let t = 0;
    function draw() {
      t += 0.016;
      k.fillStyle = "rgba(10,12,16,0.18)";
      k.fillRect(0, 0, w, h);

      // grid
      k.strokeStyle = "rgba(255,255,255,0.035)";
      k.lineWidth = 1;
      const grid = 48;
      const off = (t * 12) % grid;
      for (let x = -grid + off; x < w + grid; x += grid) {
        k.beginPath();
        k.moveTo(x, 0);
        k.lineTo(x, h);
        k.stroke();
      }
      for (let y = -grid + off; y < h + grid; y += grid) {
        k.beginPath();
        k.moveTo(0, y);
        k.lineTo(w, y);
        k.stroke();
      }

      // electric arc between random points occasionally
      if (Math.random() < 0.04) {
        const x1 = Math.random() * w;
        const y1 = Math.random() * h;
        const x2 = x1 + (Math.random() - 0.5) * 260;
        const y2 = y1 + (Math.random() - 0.5) * 260;
        k.strokeStyle = `rgba(250,204,21,${0.35 + Math.random() * 0.35})`;
        k.lineWidth = 1.2;
        k.beginPath();
        k.moveTo(x1, y1);
        const steps = 8;
        for (let i = 1; i <= steps; i++) {
          const px = x1 + (x2 - x1) * (i / steps) + (Math.random() - 0.5) * 18;
          const py = y1 + (y2 - y1) * (i / steps) + (Math.random() - 0.5) * 18;
          k.lineTo(px, py);
        }
        k.stroke();
        // glow
        k.strokeStyle = `rgba(250,204,21,0.12)`;
        k.lineWidth = 6;
        k.stroke();
      }

      // particles
      if (Math.random() < 0.6) spawn();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = Math.min(1, p.life / 30) * 0.9;
        k.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha})`;
        k.beginPath();
        k.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        k.fill();
        // trail
        k.strokeStyle = `hsla(${p.hue}, 90%, 60%, ${alpha * 0.25})`;
        k.lineWidth = 0.6;
        k.beginPath();
        k.moveTo(p.x, p.y);
        k.lineTo(p.x - p.vx * 6, p.y - p.vy * 6);
        k.stroke();
      }

      // vignette
      const grad = k.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
      grad.addColorStop(0, "rgba(10,12,16,0)");
      grad.addColorStop(1, "rgba(10,12,16,0.55)");
      k.fillStyle = grad;
      k.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
