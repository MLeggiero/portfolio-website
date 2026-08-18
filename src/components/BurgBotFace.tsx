import { useRef, useEffect } from 'react';
import {
    approach,
    blendAmbient,
    blendFace,
    clamp,
    copyFace,
    curve,
    getExpression,
    lerp,
    type AmbientMotion,
    type Curve,
    type EyeParams,
    type FaceState,
} from '../data/burgbotFace';

/**
 * burg-bot's face, running live.
 *
 * A port of the robot's own renderer and animation layers
 * (burgerbot_face/{renderer,layers,animator}.py) from pygame to canvas. Same
 * coordinate system, same easing, same blink distribution. The robot draws
 * this on a 7" DSI panel through KMS/DRM; here it draws to a 2D context.
 *
 * The eyes follow the pointer because that is exactly what the real gaze layer
 * does with a lidar target: something is nearby, so look at it.
 */

/* ── blink layer ──────────────────────────────────────────────── */

const BLINK_MEAN_INTERVAL = 4.0;
const BLINK_MIN_INTERVAL = 1.2;
const BLINK_DURATION = 0.13;
const DOUBLE_BLINK_CHANCE = 0.15;

/* ── gaze layer ───────────────────────────────────────────────── */

const GAZE_FOLLOW_RATE = 9.0;
const GAZE_EYE_SHIFT_X = 0.1;
const GAZE_EYE_SHIFT_Y = 0.07;

const easeOutCubic = curve('ease_out_cubic');

const randRange = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/** Box–Muller, standing in for Python's random.gauss. */
function gauss(mu: number, sigma: number) {
    const u = 1 - Math.random();
    const v = Math.random();
    return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Exponential draw, matching random.expovariate(1 / mean). */
const expovariate = (mean: number) => -mean * Math.log(1 - Math.random());

/**
 * Keep composited values inside what the renderer can draw. Layers add
 * blindly, so without this a stacked blink and squint can push lid coverage
 * past 1.0 and invert the eye geometry.
 */
function clampState(state: FaceState) {
    for (const eye of [state.left, state.right]) {
        eye.lidUpper = clamp(eye.lidUpper);
        eye.lidLower = clamp(eye.lidLower);
        const overlap = eye.lidUpper + eye.lidLower;
        if (overlap > 1) {
            eye.lidUpper /= overlap;
            eye.lidLower /= overlap;
        }
        eye.pupilX = clamp(eye.pupilX, -1, 1);
        eye.pupilY = clamp(eye.pupilY, -1, 1);
    }
}

const toCss = (c: readonly number[]) =>
    `rgba(${Math.round(clamp(c[0]) * 255)}, ${Math.round(clamp(c[1]) * 255)}, ${Math.round(
        clamp(c[2]) * 255,
    )}, ${clamp(c[3] ?? 1)})`;

interface Props {
    /** Name from EXPRESSIONS. Unknown names fall back to neutral. */
    expression: string;
    className?: string;
}

const BurgBotFace = ({ expression, className }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<string>(expression);

    // Kept in a ref so the animation loop reads the latest requested pose
    // without being torn down and rebuilt on every expression change.
    useEffect(() => {
        requestRef.current = expression;
    }, [expression]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let width = 0;
        let height = 0;
        let scale = 1;
        let originX = 0;
        let originY = 0;

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const dpr = window.devicePixelRatio || 1;
            width = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // Uniform scale, so a circle is a circle on a non-square panel.
            scale = Math.min(width, height) / 2;
            originX = width / 2;
            originY = height / 2;
        };

        /* ── animator ────────────────────────────────────────────── */

        const initial = getExpression(requestRef.current);
        let shownName = initial.name;
        let fromState: FaceState = copyFace(initial.state);
        let toState: FaceState = copyFace(initial.state);
        let fromAmbient: AmbientMotion = initial.ambient;
        let toAmbient: AmbientMotion = initial.ambient;
        let elapsed = 0;
        let duration = 0;
        let blendCurve: Curve = curve(initial.curve);

        const baseState = (): FaceState => {
            if (duration <= 0) return copyFace(toState);
            return blendFace(fromState, toState, blendCurve(clamp(elapsed / duration)));
        };

        const baseAmbient = (): AmbientMotion => {
            if (duration <= 0) return toAmbient;
            return blendAmbient(fromAmbient, toAmbient, blendCurve(clamp(elapsed / duration)));
        };

        /**
         * A new expression always blends from wherever the face currently *is*,
         * not from the pose it was last told to hold. Interrupting a
         * half-finished transition is the normal case, and starting the new
         * blend from the stale target is what makes a face look glitchy.
         */
        const setExpression = (name: string) => {
            const spec = getExpression(name);
            if (spec.name === shownName) return;
            fromState = baseState();
            fromAmbient = baseAmbient();
            toState = copyFace(spec.state);
            toAmbient = spec.ambient;
            blendCurve = curve(spec.curve);
            duration = reduceMotion ? 0 : spec.blendTime;
            elapsed = 0;
            shownName = spec.name;
        };

        /* ── blink layer ─────────────────────────────────────────── */

        let blinkIntervalScale = 1;
        let blinkAmbientEnabled = true;
        let blinkAmount = 0;
        let blinking = false;
        let pendingDouble = false;
        let blinkT = 0;

        // Intervals are drawn from an exponential distribution rather than a
        // fixed period. A metronomic blink is worse than no blink at all.
        const drawInterval = () =>
            (BLINK_MIN_INTERVAL + expovariate(BLINK_MEAN_INTERVAL)) * blinkIntervalScale;
        let timeToNextBlink = drawInterval();

        const updateBlink = (dt: number) => {
            if (!blinkAmbientEnabled) {
                // Not advanced while suppressed (e.g. through a startle) rather
                // than reset, so blinking resumes on roughly its normal
                // schedule instead of firing the instant suppression lifts.
                blinkAmount = 0;
                return;
            }
            if (blinking) {
                blinkT += dt;
                const phase = blinkT / BLINK_DURATION;
                if (phase >= 1) {
                    blinking = false;
                    blinkAmount = 0;
                    if (pendingDouble) {
                        pendingDouble = false;
                        timeToNextBlink = 0.09;
                    } else {
                        timeToNextBlink = drawInterval();
                    }
                } else if (phase < 0.42) {
                    // Asymmetric: lids snap shut and open more gently, like
                    // real eyelids. A symmetric triangle reads as a shutter.
                    blinkAmount = easeOutCubic(phase / 0.42);
                } else {
                    blinkAmount = 1 - easeOutCubic((phase - 0.42) / 0.58);
                }
            } else {
                timeToNextBlink -= dt;
                if (timeToNextBlink <= 0) {
                    blinking = true;
                    blinkT = 0;
                    pendingDouble = Math.random() < DOUBLE_BLINK_CHANCE;
                }
            }
        };

        const applyBlink = (state: FaceState) => {
            if (blinkAmount <= 0) return;
            for (const eye of [state.left, state.right]) {
                // Blinking a 0.17-high bar just looks like a glitch.
                if (eye.height < 0.15) continue;
                eye.lidUpper = lerp(eye.lidUpper, 0.55, blinkAmount);
                eye.lidLower = lerp(eye.lidLower, 0.45, blinkAmount);
            }
        };

        /* ── idle layer ──────────────────────────────────────────── */

        // Independent accumulators, so sway and tilt drift out of phase with
        // each other instead of both peaking on the same beat.
        let idleT = 0;
        let swayT = 0;
        let tiltT = 1.7;
        let pulseT = 3.1;
        let ambient: AmbientMotion = initial.ambient;

        const updateIdle = (dt: number) => {
            idleT += dt;
            swayT += dt * ambient.swayRate;
            tiltT += dt * ambient.tiltRate;
            pulseT += dt;
        };

        const applyIdle = (state: FaceState) => {
            const rate = Math.max(0.05, ambient.breathRate);
            const depth = ambient.breathDepth;

            // Two waves at periods that scale inversely with rate, so a faster
            // breather does not just get louder, it gets quicker too.
            const slow = Math.sin((2 * Math.PI * idleT * rate) / 4.3);
            const fast = Math.sin((2 * Math.PI * idleT * rate) / 2.7 + 1.1);

            state.faceOffsetY += depth * (0.013 * slow + 0.004 * fast);
            const breath = depth * (0.009 * slow + 0.003 * fast);
            state.faceScaleX += breath * 0.5;
            state.faceScaleY += breath;

            state.faceOffsetX += ambient.sway * Math.sin(swayT);
            state.faceTilt += ambient.tilt * Math.sin(tiltT);

            if (ambient.eyePulse > 1e-4) {
                // Out of phase with each other. In lockstep it reads as the
                // whole face breathing again rather than as something
                // happening in the eyes themselves.
                const pl = 1 + ambient.eyePulse * Math.sin(pulseT);
                const pr = 1 + ambient.eyePulse * Math.sin(pulseT * 1.13 + 0.9);
                state.left.width *= pl;
                state.left.height *= pl;
                state.right.width *= pr;
                state.right.height *= pr;
            }
        };

        /* ── gaze layer ──────────────────────────────────────────── */

        let gazeX = 0;
        let gazeY = 0;
        let wanderX = 0;
        let wanderY = 0;
        let timeToWander = 0;
        let saccadeX = 0;
        let saccadeY = 0;
        let timeToSaccade = 0;
        let target: { x: number; y: number } | null = null;

        const updateGaze = (dt: number) => {
            // Activity scales both how often the idle gaze moves and how far
            // it goes. At 0 the interval stretches and the amplitude collapses,
            // settling into a held stare with no separate "locked" code path.
            const activity = clamp(ambient.gazeActivity, 0, 3);
            const intervalScale = 1 / Math.max(activity, 0.05);

            timeToWander -= dt;
            if (timeToWander <= 0) {
                timeToWander = randRange(1.4, 4.0) * intervalScale;
                wanderX = randRange(-0.45, 0.45) * activity;
                wanderY = randRange(-0.25, 0.3) * activity + ambient.gazeBiasY;
            }

            // Microsaccades continue even while fixating. Real eyes are never
            // still, and adding that jitter is the cheapest improvement here.
            timeToSaccade -= dt;
            if (timeToSaccade <= 0) {
                timeToSaccade = randRange(0.35, 1.6) * intervalScale;
                saccadeX = gauss(0, 0.035) * activity;
                saccadeY = gauss(0, 0.025) * activity;
            }

            let tx: number;
            let ty: number;
            let rate: number;
            if (target) {
                tx = target.x;
                ty = target.y;
                rate = GAZE_FOLLOW_RATE;
            } else {
                tx = wanderX;
                ty = wanderY;
                rate = GAZE_FOLLOW_RATE * 0.28; // unhurried when nothing has its attention
            }

            gazeX = approach(gazeX, tx, rate, dt);
            gazeY = approach(gazeY, ty, rate, dt);
        };

        const applyGaze = (state: FaceState) => {
            const gx = clamp(gazeX + saccadeX, -1, 1);
            const gy = clamp(gazeY + saccadeY, -1, 1);
            for (const eye of [state.left, state.right]) {
                eye.pupilX += gx;
                eye.pupilY += gy;
                // With pupils disabled (the default look) the eye body itself
                // has to carry the gaze, or the face cannot point at anything.
                eye.centerX += gx * GAZE_EYE_SHIFT_X;
                eye.centerY += gy * GAZE_EYE_SHIFT_Y;
            }
        };

        /* ── rendering (renderer.py) ─────────────────────────────── */

        const drawEye = (state: FaceState, eye: EyeParams, color: string) => {
            const w = eye.width * state.faceScaleX * scale;
            const h = eye.height * state.faceScaleY * scale;
            if (w < 1 || h < 1) return;

            const fx = eye.centerX * state.faceScaleX + state.faceOffsetX;
            const fy = eye.centerY * state.faceScaleY + state.faceOffsetY;
            const px = originX + fx * scale;
            const py = originY - fy * scale; // y is up in face space

            ctx.save();
            ctx.translate(px, py);
            // Per-eye roll plus the whole-face tilt, in one rotation. Canvas
            // y grows downward, so a positive (counter-clockwise) roll negates.
            ctx.rotate(-(eye.rotation + state.faceTilt));

            const halfW = w / 2;
            const halfH = h / 2;

            if (eye.lidUpper > 0.001 || eye.lidLower > 0.001) {
                // Lids as half-planes cut out of the eye. The robot builds an
                // alpha mask and multiplies it in; an even-odd clip is the
                // same result without an offscreen surface per eye.
                const slope = Math.tan(eye.lidAngle);
                const boundsX = halfW * 1.6 + 8;
                const boundsY = halfH * 1.6 + Math.abs(slope) * boundsX + 8;

                ctx.beginPath();
                ctx.rect(-boundsX, -boundsY, boundsX * 2, boundsY * 2);

                if (eye.lidUpper > 0.001) {
                    // Edge through (0, y) with slope tan(lid_angle), authored
                    // as "inner corner down"; mirroring already negated it.
                    const y = -halfH + h * eye.lidUpper;
                    ctx.moveTo(-boundsX, y - slope * boundsX);
                    ctx.lineTo(boundsX, y + slope * boundsX);
                    ctx.lineTo(boundsX, -boundsY);
                    ctx.lineTo(-boundsX, -boundsY);
                    ctx.closePath();
                }
                if (eye.lidLower > 0.001) {
                    // The lower lid stays level; angling both reads as a
                    // squint rather than the expression lid_angle was for.
                    const y = halfH - h * eye.lidLower;
                    ctx.moveTo(-boundsX, y);
                    ctx.lineTo(boundsX, y);
                    ctx.lineTo(boundsX, boundsY);
                    ctx.lineTo(-boundsX, boundsY);
                    ctx.closePath();
                }
                ctx.clip('evenodd');
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            if (eye.cornerRadius >= 0.999) {
                // A fully rounded tall rect is a capsule: straight sides with
                // domed ends. That is a visibly different silhouette from an
                // oval on a cartoon face, so draw a real ellipse at the top.
                ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
            } else {
                const r = (Math.min(w, h) / 2) * clamp(eye.cornerRadius);
                ctx.roundRect(-halfW, -halfH, w, h, r);
            }
            ctx.fill();

            if (eye.pupilRadius > 0.001) {
                const pr = eye.pupilRadius * scale;
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(
                    eye.pupilX * (halfW - pr),
                    -eye.pupilY * (halfH - pr),
                    pr,
                    0,
                    Math.PI * 2,
                );
                ctx.fill();
            }

            ctx.restore();
        };

        const render = (state: FaceState) => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
            const color = toCss(state.color);
            drawEye(state, state.left, color);
            drawEye(state, state.right, color);
        };

        /* ── frame ───────────────────────────────────────────────── */

        const frame = (dt: number) => {
            setExpression(requestRef.current);
            elapsed += dt;
            if (duration > 0 && elapsed >= duration) duration = 0;

            const state = baseState();

            if (!reduceMotion) {
                ambient = baseAmbient();
                blinkIntervalScale = Math.max(0.05, ambient.blinkIntervalScale);
                blinkAmbientEnabled = ambient.blinkEnabled;

                // Order matters and matches the robot's compositor.
                updateGaze(dt);
                updateIdle(dt);
                updateBlink(dt);
                applyGaze(state);
                applyIdle(state);
                applyBlink(state);
            }

            clampState(state);
            render(state);
        };

        /* ── pointer as the gaze target ──────────────────────────── */

        const handlePointer = (clientX: number, clientY: number) => {
            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            target = {
                x: clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
                y: clamp(-(((clientY - rect.top) / rect.height) * 2 - 1), -1, 1),
            };
        };

        const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
        };
        const onRelease = () => {
            target = null;
        };

        /* ── loop ────────────────────────────────────────────────── */

        let raf = 0;
        let last = performance.now();

        const tick = (now: number) => {
            // Cap dt so a backgrounded tab does not resume with one enormous
            // step that snaps every layer to its extreme.
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;
            frame(dt);
            raf = window.requestAnimationFrame(tick);
        };

        resize();

        const observer = new ResizeObserver(() => {
            resize();
            if (reduceMotion) frame(0);
        });
        if (canvas.parentElement) observer.observe(canvas.parentElement);

        if (reduceMotion) {
            // Hold still. Expression changes still need a repaint, so poll at
            // a low rate rather than running a full animation loop.
            frame(0);
            const poll = window.setInterval(() => {
                if (getExpression(requestRef.current).name !== shownName) frame(0);
            }, 120);
            return () => {
                window.clearInterval(poll);
                observer.disconnect();
            };
        }

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onRelease, { passive: true });
        document.addEventListener('mouseleave', onRelease);
        raf = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onRelease);
            document.removeEventListener('mouseleave', onRelease);
            observer.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={className ?? 'w-full h-full block'}
            aria-label="burg-bot's face, rendered live from the robot's own expression data"
            role="img"
        />
    );
};

export default BurgBotFace;
