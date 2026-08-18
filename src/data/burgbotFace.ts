/**
 * burg-bot's face, ported to the browser.
 *
 * Every number here is lifted from the robot's own source
 * (github.com/MLeggiero/burg-bot, burgerbot_ws/src/burgerbot_face) rather than
 * re-authored to look nice on a web page. `face_state.py` describes a face as
 * a struct of floats and `expressions.py` is the keyframe library on top of
 * it, so the whole thing crosses over exactly. This is the same face the 7"
 * panel draws, running on a canvas instead of pygame.
 *
 * That is also why the face is two ovals and nothing else. With no mouth and
 * no brows, every emotion has to come out of eye geometry, timing and motion.
 */

/* ── easing (easing.py) ────────────────────────────────────────── */

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent exponential smoothing toward a target. */
export function approach(current: number, target: number, rate: number, dt: number) {
    if (rate <= 0) return target;
    return current + (target - current) * (1 - Math.exp(-rate * dt));
}

export type Curve = (t: number) => number;

export const CURVES: Record<string, Curve> = {
    linear: (t) => t,
    ease_in_cubic: (t) => t * t * t,
    ease_out_cubic: (t) => 1 - (1 - t) ** 3,
    ease_in_out_cubic: (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2,
    // Overshoots past the target, then settles, giving a pose physical weight.
    ease_out_back: (t) => {
        const overshoot = 1.70158;
        const f = t - 1;
        return 1 + (overshoot + 1) * f * f * f + overshoot * f * f;
    },
    // Springy settle. Reserved for startle and other high-energy reactions.
    ease_out_elastic: (t) => {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        const c4 = (2 * Math.PI) / 3;
        return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    ease_out_quad: (t) => 1 - (1 - t) ** 2,
};

export const curve = (name: string): Curve => CURVES[name] ?? CURVES.ease_in_out_cubic;

/* ── the parametric face (face_state.py) ───────────────────────── */

/**
 * One eye. Coordinates are uniform normalised device units: y is up, and the
 * scale is min(width, height) / 2 so a circle stays circular on any panel.
 */
export interface EyeParams {
    centerX: number;
    centerY: number;
    width: number;
    height: number;
    /** 0 = sharp rectangle, 1 = a true ellipse. Rounding reads as friendly. */
    cornerRadius: number;
    /** Whole-eye roll, radians. With no eyebrows, this does their job. */
    rotation: number;
    pupilX: number;
    pupilY: number;
    pupilRadius: number;
    /** Fraction of the eye hidden by each lid, 0..1. Both at 0.5 = shut. */
    lidUpper: number;
    lidLower: number;
    /** Upper-lid tilt, radians; positive angles the inner corner downward. */
    lidAngle: number;
}

/**
 * The intrinsic motion that belongs to an expression.
 *
 * A pose on its own is a still image. This is where most of the perceived
 * life comes from: startle reads as startle largely because the face *stops*,
 * and sleepy reads as sleepy because everything slows down.
 */
export interface AmbientMotion {
    breathRate: number;
    breathDepth: number;
    sway: number;
    swayRate: number;
    tilt: number;
    tiltRate: number;
    /** Out-of-phase size pulsing between the eyes. Small values only. */
    eyePulse: number;
    blinkIntervalScale: number;
    blinkEnabled: boolean;
    /** 0 is a locked stare, 2 is actively scanning the room. */
    gazeActivity: number;
    gazeBiasY: number;
}

export type Rgba = [number, number, number, number];

export interface FaceState {
    left: EyeParams;
    right: EyeParams;
    faceOffsetX: number;
    faceOffsetY: number;
    faceTilt: number;
    faceScaleX: number;
    faceScaleY: number;
    color: Rgba;
}

const EYE_DEFAULTS: EyeParams = {
    centerX: 0,
    centerY: 0,
    width: 0.38,
    height: 0.62,
    cornerRadius: 1,
    rotation: 0,
    pupilX: 0,
    pupilY: 0,
    pupilRadius: 0,
    lidUpper: 0,
    lidLower: 0,
    lidAngle: 0,
};

const AMBIENT_DEFAULTS: AmbientMotion = {
    breathRate: 1,
    breathDepth: 1,
    sway: 0,
    swayRate: 1,
    tilt: 0,
    tiltRate: 1,
    eyePulse: 0,
    blinkIntervalScale: 1,
    blinkEnabled: true,
    gazeActivity: 1,
    gazeBiasY: 0,
};

export const eye = (o: Partial<EyeParams> = {}): EyeParams => ({ ...EYE_DEFAULTS, ...o });
const ambient = (o: Partial<AmbientMotion> = {}): AmbientMotion => ({ ...AMBIENT_DEFAULTS, ...o });

/**
 * Mirror an eye across the vertical centreline, so an expression only has to
 * be authored once. Everything directional negates. Forgetting one of these
 * produces a face that is subtly, unplaceably wrong.
 */
export const mirrored = (e: EyeParams): EyeParams => ({
    ...e,
    centerX: -e.centerX,
    pupilX: -e.pupilX,
    lidAngle: -e.lidAngle,
    rotation: -e.rotation,
});

export const copyFace = (s: FaceState): FaceState => ({
    ...s,
    left: { ...s.left },
    right: { ...s.right },
    color: [...s.color] as Rgba,
});

/* ── blending ──────────────────────────────────────────────────── */

const blendEye = (a: EyeParams, b: EyeParams, t: number): EyeParams => ({
    centerX: lerp(a.centerX, b.centerX, t),
    centerY: lerp(a.centerY, b.centerY, t),
    width: lerp(a.width, b.width, t),
    height: lerp(a.height, b.height, t),
    cornerRadius: lerp(a.cornerRadius, b.cornerRadius, t),
    rotation: lerp(a.rotation, b.rotation, t),
    pupilX: lerp(a.pupilX, b.pupilX, t),
    pupilY: lerp(a.pupilY, b.pupilY, t),
    pupilRadius: lerp(a.pupilRadius, b.pupilRadius, t),
    lidUpper: lerp(a.lidUpper, b.lidUpper, t),
    lidLower: lerp(a.lidLower, b.lidLower, t),
    lidAngle: lerp(a.lidAngle, b.lidAngle, t),
});

/**
 * Crossfaded alongside the pose, so a transition doesn't look like two
 * animation styles spliced together, snapping straight from sleepy's slow
 * heavy breathing into happy's bounce before the face has even arrived.
 */
export const blendAmbient = (a: AmbientMotion, b: AmbientMotion, t: number): AmbientMotion => ({
    breathRate: lerp(a.breathRate, b.breathRate, t),
    breathDepth: lerp(a.breathDepth, b.breathDepth, t),
    sway: lerp(a.sway, b.sway, t),
    swayRate: lerp(a.swayRate, b.swayRate, t),
    tilt: lerp(a.tilt, b.tilt, t),
    tiltRate: lerp(a.tiltRate, b.tiltRate, t),
    eyePulse: lerp(a.eyePulse, b.eyePulse, t),
    blinkIntervalScale: lerp(a.blinkIntervalScale, b.blinkIntervalScale, t),
    // Booleans cannot be interpolated; switch at the midpoint.
    blinkEnabled: t >= 0.5 ? b.blinkEnabled : a.blinkEnabled,
    gazeActivity: lerp(a.gazeActivity, b.gazeActivity, t),
    gazeBiasY: lerp(a.gazeBiasY, b.gazeBiasY, t),
});

export const blendFace = (a: FaceState, b: FaceState, t: number): FaceState => {
    const k = clamp(t);
    if (k <= 0) return copyFace(a);
    if (k >= 1) return copyFace(b);
    return {
        left: blendEye(a.left, b.left, k),
        right: blendEye(a.right, b.right, k),
        faceOffsetX: lerp(a.faceOffsetX, b.faceOffsetX, k),
        faceOffsetY: lerp(a.faceOffsetY, b.faceOffsetY, k),
        faceTilt: lerp(a.faceTilt, b.faceTilt, k),
        faceScaleX: lerp(a.faceScaleX, b.faceScaleX, k),
        faceScaleY: lerp(a.faceScaleY, b.faceScaleY, k),
        color: a.color.map((c, i) => lerp(c, b.color[i], k)) as Rgba,
    };
};

/* ── the expression library (expressions.py) ───────────────────── */

// Hue is a blunt but very effective signal. The eyes going red is legible
// from across a room in a way a shape change is not, so colour is reserved
// for states that genuinely warrant that much attention.
const BLUE: Rgba = [0.43, 0.78, 1.0, 1.0];
const BRIGHT: Rgba = [0.6, 0.88, 1.0, 1.0];
const DIM: Rgba = [0.22, 0.44, 0.62, 1.0];
const RED: Rgba = [1.0, 0.34, 0.32, 1.0];

/** The resting eye: a cartoon proportion, not an anatomical one. */
const BASE = eye({ centerX: -0.52, centerY: 0, width: 0.62, height: 1.0 });

function face(o: Partial<FaceState> & Pick<FaceState, 'left' | 'right'>): FaceState {
    return {
        faceOffsetX: 0,
        faceOffsetY: 0,
        faceTilt: 0,
        faceScaleX: 1,
        faceScaleY: 1,
        color: BLUE,
        ...o,
    };
}

/** Build a left/right symmetric face from a single authored (left) eye. */
const symmetric = (e: EyeParams, o: Partial<FaceState> = {}): FaceState =>
    face({ left: e, right: mirrored(e), ...o });

export interface ExpressionSpec {
    name: string;
    state: FaceState;
    /** Seconds to ease in when this becomes the winning expression. */
    blendTime: number;
    curve: string;
    ambient: AmbientMotion;
    /** The art direction: why the pose is shaped the way it is. */
    note: string;
    /** What makes the real robot wear it. Nothing here is decorative. */
    trigger: string;
}

export const EXPRESSIONS: ExpressionSpec[] = [
    {
        name: 'neutral',
        state: symmetric(BASE),
        blendTime: 0.35,
        curve: 'ease_in_out_cubic',
        ambient: ambient({ sway: 0.012, swayRate: 0.7, tilt: 0.01, tiltRate: 0.5, eyePulse: 0.006 }),
        note: 'Plain tall ovals, deliberately not narrowed or tilted. This is the pose the robot spends most of its life in, so anything with an attitude in it becomes the robot’s whole personality by sheer exposure.',
        trigger: 'The resting floor. While mapping it also covers a clean run to the next frontier with nothing close by.',
    },
    {
        name: 'happy',
        state: symmetric(
            { ...BASE, height: 1.03, lidLower: 0.4, rotation: -0.06 },
            { color: BRIGHT },
        ),
        blendTime: 0.22,
        curve: 'ease_out_back',
        ambient: ambient({
            breathRate: 1.7, breathDepth: 1.9, tilt: 0.028, tiltRate: 1.6,
            eyePulse: 0.018, blinkIntervalScale: 0.75, gazeActivity: 1.4,
        }),
        note: 'The squint comes from the lower lid, not the upper. That is the difference between a real smile and a polite one, and it survives being rendered as two blue blobs.',
        trigger: 'A navigation goal succeeded, or someone touched the screen. Physical contact always shows.',
    },
    {
        name: 'curious',
        state: face({
            left: { ...BASE, height: 1.15, width: 0.65, centerY: 0.05 },
            right: mirrored({ ...BASE, height: 0.78, width: 0.59, lidUpper: 0.14, rotation: 0.1 }),
            faceTilt: 0.11,
        }),
        blendTime: 0.3,
        curve: 'ease_in_out_cubic',
        ambient: ambient({
            breathRate: 1.2, sway: 0.03, swayRate: 0.55, tilt: 0.055, tiltRate: 0.42,
            eyePulse: 0.012, gazeActivity: 2.0,
        }),
        note: 'Asymmetry is the entire trick. One eye taller, one slightly squinted, a small head tilt, and the face reads as actively wondering rather than merely switched on.',
        trigger: 'The resting floor while the robot is exploring a space it has never seen.',
    },
    {
        name: 'focused',
        state: symmetric({ ...BASE, height: 0.53, width: 0.68, lidUpper: 0.12, cornerRadius: 0.6 }),
        blendTime: 0.28,
        curve: 'ease_in_out_cubic',
        ambient: ambient({
            breathRate: 0.8, breathDepth: 0.45, sway: 0.004, tilt: 0.004,
            blinkIntervalScale: 1.8, gazeActivity: 0.25,
        }),
        note: 'Narrowed, squared off and steady. Worn while actually following a path, so it has to be legible without being tiring to look at.',
        trigger: 'Goal-directed navigation outside exploration, somewhere it has actually been told to be.',
    },
    {
        name: 'confused',
        state: face({
            left: { ...BASE, height: 1.09, width: 0.65, rotation: -0.22 },
            right: mirrored({ ...BASE, height: 0.62, width: 0.56, lidUpper: 0.28, rotation: -0.18 }),
            faceTilt: -0.09,
        }),
        blendTime: 0.3,
        curve: 'ease_in_out_cubic',
        ambient: ambient({
            breathRate: 1.3, sway: 0.026, swayRate: 1.3, tilt: 0.042, tiltRate: 0.85,
            gazeActivity: 2.2,
        }),
        note: 'Mismatched everything: one eye large and rolled outward, the other small and squinted, head tilted the other way.',
        trigger: 'AMCL’s pose covariance grew past threshold. The robot genuinely is unsure where it is.',
    },
    {
        name: 'startled',
        state: symmetric({ ...BASE, width: 0.93, height: 1.21, centerY: 0.02 }, { color: BRIGHT }),
        blendTime: 0.12,
        curve: 'ease_out_elastic',
        ambient: ambient({
            breathRate: 2.4, breathDepth: 0.2, sway: 0, tilt: 0,
            blinkEnabled: false, gazeActivity: 0.1,
        }),
        note: 'Everything wide and round, and the face stops moving. People do not blink or drift while frightened. The elastic curve makes it arrive with a physical jolt; a linear blend into this pose looks like a menu transition rather than a fright.',
        trigger: 'A lidar return inside 22 cm, or the safety stop firing. Highest priority band, so it always wins the face.',
    },
    {
        name: 'sad',
        state: symmetric(
            {
                ...BASE, height: 0.84, width: 0.59, centerY: -0.06,
                lidUpper: 0.3, lidAngle: -0.38, rotation: -0.2, pupilY: -0.25,
            },
            { color: DIM },
        ),
        blendTime: 0.55,
        curve: 'ease_in_out_cubic',
        ambient: ambient({
            breathRate: 0.55, breathDepth: 1.5, sway: 0.01, swayRate: 0.35,
            tilt: 0.014, tiltRate: 0.3, blinkIntervalScale: 1.4,
            gazeActivity: 0.35, gazeBiasY: -0.3,
        }),
        note: 'Inner corners lifted, lids heavy, eyes dropped and rolled outward. Slow to arrive, because sadness that snaps on reads as a costume change.',
        trigger: 'A navigation goal was aborted. It tried, and could not get there.',
    },
    {
        name: 'sleepy',
        state: symmetric(
            { ...BASE, height: 0.9, lidUpper: 0.62, lidLower: 0.06, centerY: -0.06 },
            { color: DIM },
        ),
        blendTime: 0.7,
        curve: 'ease_in_out_cubic',
        ambient: ambient({
            breathRate: 0.4, breathDepth: 2.4, sway: 0.014, swayRate: 0.25,
            tilt: 0.02, tiltRate: 0.22, blinkIntervalScale: 0.45,
            gazeActivity: 0.2, gazeBiasY: -0.45,
        }),
        note: 'Mostly shut, sitting low. Distinct from sad because the lids are level rather than angled. Tiredness has no opinion, sadness does.',
        trigger: 'Battery below 20%. The face is the battery indicator.',
    },
    {
        name: 'nervous',
        state: symmetric({ ...BASE, height: 0.86, width: 0.56, lidUpper: 0.16, centerY: 0.01 }),
        blendTime: 0.16,
        curve: 'ease_out_cubic',
        ambient: ambient({
            breathRate: 2.2, breathDepth: 0.35, sway: 0.022, swayRate: 2.4,
            tilt: 0.02, tiltRate: 2.1, eyePulse: 0.022,
            blinkIntervalScale: 0.5, gazeActivity: 2.6,
        }),
        note: 'Narrowed like focused, but where focused holds dead still, nervous trembles: fast sway, quick blinks, eyes everywhere. Same base shape, opposite tempo, and that contrast is what sells “wary” rather than “concentrating” from eye geometry alone.',
        trigger: 'Mid-sweep, with something inside half a metre. This is what makes a mapping run read as neutral-while-clear, nervous-while-hugging-a-wall.',
    },
    {
        name: 'determined',
        state: symmetric({
            ...BASE, height: 0.71, width: 0.65, lidUpper: 0.22,
            lidAngle: 0.34, rotation: 0.16, cornerRadius: 0.75,
        }),
        blendTime: 0.2,
        curve: 'ease_in_out_cubic',
        ambient: ambient({
            breathRate: 1.25, breathDepth: 0.7, sway: 0.005, tilt: 0.006,
            blinkIntervalScale: 2.2, gazeActivity: 0.2,
        }),
        note: 'The same narrowing as focused, but the lids angle inner-down and the ovals roll toward each other. That sign flip is the whole difference between concentrating and meaning it.',
        trigger: 'Available to any source on the expression topic. It is the one pose here the mood arbiter never bids for itself.',
    },
    {
        name: 'error',
        state: symmetric(
            { ...BASE, width: 0.71, height: 0.17, centerY: 0.02, cornerRadius: 0.25 },
            { color: RED },
        ),
        blendTime: 0.15,
        curve: 'ease_in_out_cubic',
        ambient: ambient({
            breathRate: 1.0, breathDepth: 0, sway: 0, tilt: 0,
            blinkEnabled: false, gazeActivity: 0,
        }),
        note: 'Flat, short, dead-level red bars. Unmistakably “stopped”, and visually unlike every other pose here even at a glance.',
        trigger: 'Battery below 7%. Colour is spent here because this is the one state that has to carry across a room.',
    },
];

export const EXPRESSION_NAMES = EXPRESSIONS.map((e) => e.name);

const BY_NAME = new Map(EXPRESSIONS.map((e) => [e.name, e]));

/** Look up an expression, falling back to neutral for unknown names. */
export const getExpression = (name: string): ExpressionSpec =>
    BY_NAME.get(name) ?? EXPRESSIONS[0];
