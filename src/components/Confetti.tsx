import { useEffect, useRef, useState } from 'react';

/** Lightweight confetti burst using canvas. Renders colored particles that fall
 *  with gravity and fade out. Self-contained, no dependencies. */
export function Confetti({ fire }: { fire: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [active, setActive] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (fire === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = ['#527d4e', '#7c6fb0', '#e09132', '#9fbc9b', '#a48bd3', '#d99a3f'];
    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    const count = Math.min(160, Math.floor(W / 8));

    interface P { x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; color: string; life: number; }
    const particles: P[] = Array.from({ length: count }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 200,
      y: H * 0.3 + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -8 - 2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));

    setActive(true);
    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of particles) {
        p.vy += 0.18;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.008;
        if (p.life <= 0 || p.y > H + 40) continue;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      frame++;
      if (alive && frame < 400) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setActive(false);
        ctx.clearRect(0, 0, W, H);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [fire]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-50 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden
    />
  );
}
