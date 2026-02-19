import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  baseX: number; baseY: number;
  size: number;
  alpha: number;
  pulse: number;
  drift: number;
}

const BlueprintCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouse = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  const initParticles = useCallback((w: number, h: number): Particle[] => {
    const particles: Particle[] = [];
    const count = Math.min(80, Math.floor((w * h) / 15000));
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      particles.push({
        x, y, vx: 0, vy: 0,
        baseX: x, baseY: y,
        size: 0.4 + Math.random() * 1.2,
        alpha: 0.03 + Math.random() * 0.12,
        pulse: Math.random() * Math.PI * 2,
        drift: 0.08 + Math.random() * 0.15,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, dpr = 1;
    let particles: Particle[] = [];

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = initParticles(w, h);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouch, { passive: true });

    let t = 0;

    const draw = () => {
      t += 0.016;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const reduced = prefersReducedMotion.current;

      // Smooth mouse (deliberate lag)
      const lerp = 0.04;
      if (mx > 0) {
        smoothMouse.current.x += (mx - smoothMouse.current.x) * lerp;
        smoothMouse.current.y += (my - smoothMouse.current.y) * lerp;
      }
      const smx = smoothMouse.current.x;
      const smy = smoothMouse.current.y;

      ctx.clearRect(0, 0, w, h);

      // ── Ambient glow that follows mouse ─────────────────────────
      // Very subtle — just enough to give a sense of depth
      if (smx > 0) {
        const glowR = Math.max(w, h) * 0.35;
        const glow = ctx.createRadialGradient(smx, smy, 0, smx, smy, glowR);
        glow.addColorStop(0, 'rgba(255,255,255,0.018)');
        glow.addColorStop(0.4, 'rgba(255,255,255,0.006)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Particles ───────────────────────────────────────────────
      particles.forEach((p) => {
        if (!reduced) {
          // Glacial drift
          p.baseX += Math.sin(t * 0.15 + p.pulse) * p.drift * 0.05;
          p.baseY += Math.cos(t * 0.12 + p.pulse * 1.3) * p.drift * 0.04;

          // Wrap around
          if (p.baseX < -20) p.baseX = w + 20;
          if (p.baseX > w + 20) p.baseX = -20;
          if (p.baseY < -20) p.baseY = h + 20;
          if (p.baseY > h + 20) p.baseY = -20;

          // Gentle repulsion
          const dx = p.x - smx;
          const dy = p.y - smy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = ((120 - dist) / 120) * 0.5;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }

          p.vx += (p.baseX - p.x) * 0.004;
          p.vy += (p.baseY - p.y) * 0.004;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += 0.006;
        }

        // Brighten near cursor
        const dxS = p.x - smx;
        const dyS = p.y - smy;
        const distS = Math.sqrt(dxS * dxS + dyS * dyS);
        const proximity = smx > 0 ? Math.max(0, 1 - distS / 300) : 0;
        const finalAlpha = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse)) + proximity * 0.15;

        // Soft glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
        grad.addColorStop(0, `rgba(255,255,255,${finalAlpha * 0.6})`);
        grad.addColorStop(0.5, `rgba(200,210,230,${finalAlpha * 0.15})`);
        grad.addColorStop(1, 'rgba(200,210,230,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(255,255,255,${finalAlpha * 1.2})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Faint connections near cursor only ──────────────────────
      if (smx > 0) {
        ctx.lineWidth = 0.3;
        for (let i = 0; i < particles.length; i++) {
          const pi = particles[i];
          const diS = Math.sqrt((pi.x - smx) ** 2 + (pi.y - smy) ** 2);
          if (diS > 250) continue;
          for (let j = i + 1; j < particles.length; j++) {
            const pj = particles[j];
            const dx = pi.x - pj.x;
            const dy = pi.y - pj.y;
            const dist = dx * dx + dy * dy;
            if (dist < 6400) {
              const alpha = 0.03 * (1 - Math.sqrt(dist) / 80) * (1 - diS / 250);
              ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
              ctx.beginPath();
              ctx.moveTo(pi.x, pi.y);
              ctx.lineTo(pj.x, pj.y);
              ctx.stroke();
            }
          }
        }
      }

      // ── Cursor coordinate readout ─────────────────────────────
      if (mx > 0 && !reduced) {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';

        // Grid coordinates
        const gx = Math.floor(mx / 40);
        const gy = Math.floor(my / 40);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillText(`${gx}, ${gy}`, mx + 20, my - 14);

        // Angle from center
        const angle = Math.atan2(my - h / 2, mx - w / 2) * (180 / Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillText(`${angle.toFixed(1)}°`, mx + 20, my + 2);

        // Distance from center
        const dist = Math.sqrt((mx - w / 2) ** 2 + (my - h / 2) ** 2);
        ctx.fillText(`${dist.toFixed(0)}`, mx + 20, my + 16);

        // Subtle leader line
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(mx + 6, my);
        ctx.lineTo(mx + 17, my - 6);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default BlueprintCanvas;
