import { useRef, useEffect, useCallback } from 'react';

/* ── FABRIK‑based 2D robot arm ────────────────────────────────── */

interface Joint {
  x: number;
  y: number;
}

const NUM_SEGMENTS = 3;
const SEGMENT_LENGTH = 210; // px per link
const IK_ITERATIONS = 8;

/**
 * Run one full FABRIK pass (forward + backward) in‑place.
 * joints[0] = base (re‑anchored each pass), joints[last] = end‑effector.
 */
function solveFABRIK(
  joints: Joint[],
  target: { x: number; y: number },
  base: { x: number; y: number },
) {
  for (let iter = 0; iter < IK_ITERATIONS; iter++) {
    // ── Forward pass: pull end‑effector toward target ──
    joints[joints.length - 1].x = target.x;
    joints[joints.length - 1].y = target.y;
    for (let i = joints.length - 2; i >= 0; i--) {
      const dx = joints[i].x - joints[i + 1].x;
      const dy = joints[i].y - joints[i + 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      joints[i].x = joints[i + 1].x + (dx / dist) * SEGMENT_LENGTH;
      joints[i].y = joints[i + 1].y + (dy / dist) * SEGMENT_LENGTH;
    }
    // ── Backward pass: re‑anchor base ──
    joints[0].x = base.x;
    joints[0].y = base.y;
    for (let i = 1; i < joints.length; i++) {
      const dx = joints[i].x - joints[i - 1].x;
      const dy = joints[i].y - joints[i - 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      joints[i].x = joints[i - 1].x + (dx / dist) * SEGMENT_LENGTH;
      joints[i].y = joints[i - 1].y + (dy / dist) * SEGMENT_LENGTH;
    }
  }
}

/* ───────────────────────────────────────────────────────────── */

const BlueprintCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouse = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  const initJoints = useCallback((cx: number, cy: number): Joint[] => {
    const joints: Joint[] = [];
    for (let i = 0; i <= NUM_SEGMENTS; i++) {
      joints.push({ x: cx, y: cy - i * SEGMENT_LENGTH });
    }
    return joints;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    prefersReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let w = 0,
      h = 0,
      dpr = 1;
    let joints: Joint[] = [];
    let basePos = { x: 0, y: 0 };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = window.devicePixelRatio || 1;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      basePos = { x: w / 2, y: h / 2 };
      joints = initJoints(basePos.x, basePos.y);
    };

    resize();
    window.addEventListener('resize', resize);

    /* Mouse / touch handlers — coordinates relative to canvas parent */
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouch, { passive: true });

    let t = 0;

    /* ── Main draw loop ──────────────────────────────────────── */
    const draw = () => {
      t += 0.016;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const reduced = prefersReducedMotion.current;

      // Smooth mouse (deliberate lag for fluid feel)
      const lerp = 0.08;
      if (mx > 0) {
        smoothMouse.current.x += (mx - smoothMouse.current.x) * lerp;
        smoothMouse.current.y += (my - smoothMouse.current.y) * lerp;
      }
      const smx = smoothMouse.current.x;
      const smy = smoothMouse.current.y;

      ctx.clearRect(0, 0, w, h);

      // ── Subtle ambient glow around cursor ──────────────────
      if (smx > 0) {
        const glowR = Math.max(w, h) * 0.35;
        const glow = ctx.createRadialGradient(smx, smy, 0, smx, smy, glowR);
        glow.addColorStop(0, 'rgba(44,77,228,0.04)');
        glow.addColorStop(0.4, 'rgba(44,77,228,0.012)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Solve IK ───────────────────────────────────────────
      const target =
        smx > 0
          ? { x: smx, y: smy }
          : {
            // Idle sway when no mouse
            x: basePos.x + Math.sin(t * 0.3) * 120,
            y: basePos.y - 180 + Math.cos(t * 0.22) * 60,
          };

      if (!reduced) {
        solveFABRIK(joints, target, basePos);
      }

      // ── Draw the arm ───────────────────────────────────────

      // Outer glow layer (wide, dim)
      ctx.save();
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(44,77,228,0.08)';
      ctx.shadowColor = 'rgba(44,77,228,0.3)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(joints[0].x, joints[0].y);
      for (let i = 1; i < joints.length; i++) {
        ctx.lineTo(joints[i].x, joints[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // Main arm line
      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(44,77,228,0.45)';
      ctx.shadowColor = 'rgba(44,77,228,0.5)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(joints[0].x, joints[0].y);
      for (let i = 1; i < joints.length; i++) {
        ctx.lineTo(joints[i].x, joints[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // Inner bright core line
      ctx.save();
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(160,185,255,0.35)';
      ctx.beginPath();
      ctx.moveTo(joints[0].x, joints[0].y);
      for (let i = 1; i < joints.length; i++) {
        ctx.lineTo(joints[i].x, joints[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // ── Joint circles ──────────────────────────────────────
      joints.forEach((j, idx) => {
        const isBase = idx === 0;
        const isEnd = idx === joints.length - 1;
        const radius = isBase ? 5 : isEnd ? 4 : 3;

        // Glow ring
        const grad = ctx.createRadialGradient(j.x, j.y, 0, j.x, j.y, radius * 4);
        grad.addColorStop(0, `rgba(44,77,228,${isEnd ? 0.25 : 0.15})`);
        grad.addColorStop(1, 'rgba(44,77,228,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(j.x, j.y, radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Circle outline
        ctx.strokeStyle = `rgba(44,77,228,${isEnd ? 0.7 : 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(j.x, j.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Filled dot
        ctx.fillStyle = `rgba(160,185,255,${isEnd ? 0.6 : 0.3})`;
        ctx.beginPath();
        ctx.arc(j.x, j.y, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── End‑effector accent ────────────────────────────────
      const endJ = joints[joints.length - 1];
      const pulseAlpha = 0.15 + 0.1 * Math.sin(t * 2);
      const pulseR = 12 + 4 * Math.sin(t * 2);
      const endGrad = ctx.createRadialGradient(endJ.x, endJ.y, 0, endJ.x, endJ.y, pulseR);
      endGrad.addColorStop(0, `rgba(44,77,228,${pulseAlpha})`);
      endGrad.addColorStop(1, 'rgba(44,77,228,0)');
      ctx.fillStyle = endGrad;
      ctx.beginPath();
      ctx.arc(endJ.x, endJ.y, pulseR, 0, Math.PI * 2);
      ctx.fill();

      // ── Cursor coordinate readout ──────────────────────────
      if (mx > 0 && !reduced) {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';

        // Joint angles
        for (let i = 1; i < joints.length - 1; i++) {
          const prev = joints[i - 1];
          const curr = joints[i];
          const next = joints[i + 1];
          const a1 = Math.atan2(prev.y - curr.y, prev.x - curr.x);
          const a2 = Math.atan2(next.y - curr.y, next.x - curr.x);
          let angle = ((a2 - a1) * 180) / Math.PI;
          if (angle < 0) angle += 360;
          ctx.fillStyle = 'rgba(44,77,228,0.7)';
          ctx.fillText(`θ${i} ${angle.toFixed(1)}°`, curr.x + 14, curr.y - 8);
        }

        // End‑effector position
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillText(
          `${Math.floor(endJ.x)}, ${Math.floor(endJ.y)}`,
          mx + 20,
          my - 14,
        );

        // Distance from base
        const dist = Math.sqrt(
          (endJ.x - basePos.x) ** 2 + (endJ.y - basePos.y) ** 2,
        );
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText(`r ${dist.toFixed(0)}`, mx + 20, my + 2);

        // ── Singularity detection ──────────────────────────
        const totalReach = NUM_SEGMENTS * SEGMENT_LENGTH;
        const reachRatio = dist / totalReach;
        // Position singularity: near workspace boundary
        const positionSingularity = reachRatio > 0.95;
        // Velocity singularity: any joint nearly collinear (angle ≈ 180°)
        let velocitySingularity = false;
        for (let i = 1; i < joints.length - 1; i++) {
          const prev = joints[i - 1];
          const curr = joints[i];
          const next = joints[i + 1];
          const a1 = Math.atan2(prev.y - curr.y, prev.x - curr.x);
          const a2 = Math.atan2(next.y - curr.y, next.x - curr.x);
          let ang = Math.abs(((a2 - a1) * 180) / Math.PI);
          if (ang > 180) ang = 360 - ang;
          if (ang > 172) { velocitySingularity = true; break; }
        }

        if (positionSingularity || velocitySingularity) {
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(180,40,40,0.7)';
          ctx.fillText('SINGULARITY', mx + 20, my + 16);
        }

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
  }, [initJoints]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default BlueprintCanvas;
