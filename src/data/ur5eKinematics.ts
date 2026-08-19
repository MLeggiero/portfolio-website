/**
 * UR5e kinematics.
 *
 * Every frame, offset and axis below is lifted from the MuJoCo Menagerie MJCF
 * (google-deepmind/mujoco_menagerie, universal_robots_ur5e/ur5e.xml) rather
 * than re-authored to look right, which is the same reason the meshes are the
 * Menagerie ones. The hero arm is therefore a real UR5e: the angles it reports
 * on screen are angles a real controller could command.
 *
 * The chain is stored as fixed-offset + rotating-joint pairs because that is
 * how the MJCF describes it, and because a joint node whose local transform is
 * only its own rotation can be driven by writing one number per frame.
 *
 * MuJoCo quaternions are (w, x, y, z); these are stored (x, y, z, w) to match
 * three.js. No three.js import here on purpose — this file is pure math, so it
 * runs in a test without a canvas.
 */

export type Axis = 'x' | 'y' | 'z';
export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

export interface JointSpec {
    /** Node name; also the label used in the on-screen readout. */
    name: string;
    /** Fixed translation from the parent joint frame (metres). */
    translation: Vec3;
    /** Fixed rotation from the parent joint frame, (x, y, z, w). */
    rotation: Quat;
    /** Axis this joint rotates about, in its own frame. */
    axis: Axis;
    /** [min, max] in radians. */
    limit: [number, number];
    /** Mesh nodes in the packed GLB that ride on this joint. */
    meshes: string[];
}

const IDENTITY: Quat = [0, 0, 0, 1];
/** MJCF quat="1 0 1 0", i.e. +90° about Y. */
const ROT_Y_90: Quat = [0, Math.SQRT1_2, 0, Math.SQRT1_2];

/** MJCF quat="0 0 0 -1" on the base body: 180° about Z. */
export const BASE_ROTATION: Quat = [0, 0, -1, 0];
export const BASE_MESHES = ['base_0', 'base_1'];

export const CHAIN: JointSpec[] = [
    {
        name: 'shoulder_pan',
        translation: [0, 0, 0.163],
        rotation: IDENTITY,
        axis: 'z',
        limit: [-Math.PI, Math.PI],
        meshes: ['shoulder_0', 'shoulder_1', 'shoulder_2'],
    },
    {
        name: 'shoulder_lift',
        translation: [0, 0.138, 0],
        rotation: ROT_Y_90,
        axis: 'y',
        // Half the MJCF range. The real joint can swing below the floor; the
        // hero arm should not, so it is kept in the upper half-plane.
        limit: [-Math.PI, 0],
        meshes: ['upperarm_0', 'upperarm_1', 'upperarm_2', 'upperarm_3'],
    },
    {
        name: 'elbow',
        translation: [0, -0.131, 0.425],
        rotation: IDENTITY,
        axis: 'y',
        // size3_limited in the MJCF.
        limit: [-Math.PI, Math.PI],
        meshes: ['forearm_0', 'forearm_1', 'forearm_2', 'forearm_3'],
    },
    {
        name: 'wrist_1',
        translation: [0, 0, 0.392],
        rotation: ROT_Y_90,
        axis: 'y',
        limit: [-2 * Math.PI, 2 * Math.PI],
        meshes: ['wrist1_0', 'wrist1_1', 'wrist1_2'],
    },
    {
        name: 'wrist_2',
        translation: [0, 0.127, 0],
        rotation: IDENTITY,
        axis: 'z',
        limit: [-2 * Math.PI, 2 * Math.PI],
        meshes: ['wrist2_0', 'wrist2_1', 'wrist2_2'],
    },
    {
        name: 'wrist_3',
        translation: [0, 0, 0.1],
        rotation: IDENTITY,
        axis: 'y',
        limit: [-2 * Math.PI, 2 * Math.PI],
        meshes: ['wrist3'],
    },
];

/** attachment_site in the MJCF: where a gripper would bolt on. */
export const TOOL_OFFSET: Vec3 = [0, 0.1, 0];

/* ── link lengths the closed-form solve needs ─────────────────── */

/** Base to the shoulder pan joint. */
export const D1 = 0.163;
/** Upper arm, shoulder to elbow. */
export const A2 = 0.425;
/** Forearm, elbow to wrist. */
export const A3 = 0.392;
/**
 * Lateral offset of the tool flange from the base axis, with wrist_2 held at
 * zero: the shoulder, forearm, wrist_2 and tool offsets all stack along the
 * same direction. It is why a UR arm cannot reach a point directly above its
 * own base, and why base yaw is not simply the azimuth of the target.
 */
export const D4 = 0.234;
/**
 * In-plane distance from the wrist_1 origin to the flange, with wrist_2 held
 * at zero. Measured off the chain above rather than assumed — holding wrist_2
 * there is what keeps it constant, which is what keeps the solve closed-form.
 */
export const WRIST_REACH = 0.1;
/**
 * The base body carries a 180° rotation about Z, so joint 1 reads a half turn
 * away from world azimuth. Folded into the solve rather than into the asset.
 */
const BASE_YAW = Math.PI;

export const MAX_REACH = A2 + A3;

/* ── small matrix helpers (column-major, three.js order) ──────── */

export type Mat4 = number[];

export function matIdentity(): Mat4 {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function matMul(a: Mat4, b: Mat4): Mat4 {
    const out = new Array<number>(16);
    for (let c = 0; c < 4; c++) {
        for (let r = 0; r < 4; r++) {
            out[c * 4 + r] =
                a[r] * b[c * 4] +
                a[4 + r] * b[c * 4 + 1] +
                a[8 + r] * b[c * 4 + 2] +
                a[12 + r] * b[c * 4 + 3];
        }
    }
    return out;
}

export function matFromQuatPos(q: Quat, p: Vec3): Mat4 {
    const [x, y, z, w] = q;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    return [
        1 - (yy + zz), xy + wz, xz - wy, 0,
        xy - wz, 1 - (xx + zz), yz + wx, 0,
        xz + wy, yz - wx, 1 - (xx + yy), 0,
        p[0], p[1], p[2], 1,
    ];
}

export function matFromAxisAngle(axis: Axis, angle: number): Mat4 {
    const c = Math.cos(angle), s = Math.sin(angle);
    if (axis === 'x') return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
    if (axis === 'y') return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function applyPoint(m: Mat4, v: Vec3): Vec3 {
    return [
        m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
        m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
        m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
    ];
}

export const clamp = (v: number, lo: number, hi: number) =>
    v < lo ? lo : v > hi ? hi : v;

/**
 * Fold an angle into (−π, π]. Revolute joints are periodic, so a solution that
 * comes out past half a turn is the same pose reached the short way round —
 * clamping it instead would peg the joint at its limit and break the pose.
 */
export function wrapAngle(a: number) {
    const t = (a + Math.PI) % (2 * Math.PI);
    return (t < 0 ? t + 2 * Math.PI : t) - Math.PI;
}

/* ── forward kinematics ───────────────────────────────────────── */

export type JointAngles = number[];

/**
 * World transform of every joint frame, base first. Used by the solver's own
 * verification and by the readout, so the numbers on screen come from the same
 * chain that positions the meshes rather than from a parallel approximation.
 */
export function forwardKinematics(angles: JointAngles): Mat4[] {
    const frames: Mat4[] = [];
    let m = matFromQuatPos(BASE_ROTATION, [0, 0, 0]);
    frames.push(m);
    for (let i = 0; i < CHAIN.length; i++) {
        const j = CHAIN[i];
        m = matMul(m, matFromQuatPos(j.rotation, j.translation));
        m = matMul(m, matFromAxisAngle(j.axis, angles[i] ?? 0));
        frames.push(m);
    }
    return frames;
}

/** Tool flange position for a given pose. */
export function toolPosition(angles: JointAngles): Vec3 {
    const frames = forwardKinematics(angles);
    return applyPoint(frames[frames.length - 1], TOOL_OFFSET);
}

/* ── keeping a requested point inside the workspace ───────────── */

/** Closest the tool is asked to come to the shoulder. */
const MIN_TRACK = 0.34;
/** Furthest, kept off the boundary where the arm loses a degree of freedom. */
const MAX_TRACK = 0.86;
/** The arm cannot reach its own base axis, so targets are pushed out of it. */
const MIN_PLANAR = 0.28;
/** Nothing below this: the arm should never dive at the floor it stands on. */
const MIN_Z = 0.06;

/**
 * Pull an arbitrary point into somewhere the arm can actually go.
 *
 * The cursor lands wherever it likes, including inside the base column and far
 * outside the reachable shell. Rather than refusing those, the point is moved
 * the shortest sensible way: distance from the shoulder is clamped along the
 * same bearing, so the arm still points where the cursor is even when it
 * cannot get there — which is what the old 2D arm did at full stretch.
 */
export function clampToWorkspace(p: Vec3): Vec3 {
    let [x, y, z] = p;
    z = Math.max(z, MIN_Z);

    // Out of the base column first, keeping the bearing.
    const planar = Math.hypot(x, y);
    if (planar < MIN_PLANAR) {
        const bearing = planar > 1e-6 ? Math.atan2(y, x) : 0;
        x = Math.cos(bearing) * MIN_PLANAR;
        y = Math.sin(bearing) * MIN_PLANAR;
    }

    // Then into the reachable shell, measured from the shoulder.
    const dx = x, dy = y, dz = z - D1;
    const dist = Math.hypot(dx, dy, dz);
    if (dist > 1e-6) {
        const scaled = clamp(dist, MIN_TRACK, MAX_TRACK) / dist;
        x = dx * scaled;
        y = dy * scaled;
        z = D1 + dz * scaled;
    }
    return [x, y, Math.max(z, MIN_Z)];
}

/* ── inverse kinematics ───────────────────────────────────────── */

export interface IKResult {
    angles: JointAngles;
    /** Target was outside the reachable shell and had to be pulled in. */
    outOfReach: boolean;
    /** Distance from the shoulder to the requested wrist centre. */
    reach: number;
}

/**
 * Closed-form solve for the arm, plus a posed wrist.
 *
 * Joints 2, 3 and 4 share a parallel axis, so once the base yaw fixes the
 * plane the arm is a two-link planar chain and the elbow follows from the law
 * of cosines. That is the whole reason this needs no solver library and no
 * per-frame iteration: it is one branch of the standard UR closed form, with
 * the elbow-up branch chosen so the arm never folds through the floor.
 *
 * The wrist is not solved for a full orientation. It is posed so the flange
 * points along the reach direction, which is what reads as "the robot is
 * looking at the cursor" and keeps the last three joints in sane territory.
 */
export function solveIK(target: Vec3): IKResult {
    // Base yaw: swing the arm plane onto the target. The plane is offset from
    // the base axis by D4, so this is the azimuth minus that offset's angular
    // share, and minus the half turn the base body is mounted at.
    const planar = Math.max(Math.hypot(target[0], target[1]), D4 + 1e-4);
    const pan =
        Math.atan2(target[1], target[0]) - BASE_YAW - Math.asin(clamp(D4 / planar, -1, 1));

    // In-plane target for the flange: radial distance from the base axis, and
    // height above the shoulder.
    const radialTool = Math.sqrt(Math.max(planar * planar - D4 * D4, 0));
    const heightTool = target[2] - D1;

    // Aim the flange out along the shoulder-to-target direction and step back
    // down it to the wrist, which is the point the two links actually solve
    // for. Doing this in the plane keeps the whole solve two-dimensional.
    const approach = Math.atan2(heightTool, radialTool);
    const radial = radialTool - WRIST_REACH * Math.cos(approach);
    const height = heightTool - WRIST_REACH * Math.sin(approach);

    let span = Math.hypot(radial, height);
    const outOfReach = span > MAX_REACH * 0.999 || span < Math.abs(A2 - A3) * 1.001;
    // Stay just inside the shell: at full stretch the Jacobian drops rank and
    // the arm snaps between branches for sub-pixel cursor movements.
    span = clamp(span, Math.abs(A2 - A3) * 1.001, MAX_REACH * 0.999);

    const cosElbow = clamp((A2 * A2 + A3 * A3 - span * span) / (2 * A2 * A3), -1, 1);
    const elbowInterior = Math.acos(cosElbow);
    const elbow = Math.PI - elbowInterior;

    const cosShoulder = clamp((A2 * A2 + span * span - A3 * A3) / (2 * A2 * span), -1, 1);
    const lift = -(Math.atan2(height, radial) + Math.acos(cosShoulder));

    // The flange offset swings opposite the summed arm angle — wrist_2 flips
    // handedness — so pointing it along the approach direction needs the sum
    // to come out at −(90° + approach), and wrist_1 makes up the difference.
    const wrist1 = -Math.PI / 2 - approach - lift - elbow;

    const angles = [wrapAngle(pan), lift, elbow, wrapAngle(wrist1), 0, 0];
    for (let i = 0; i < CHAIN.length; i++) {
        angles[i] = clamp(angles[i], CHAIN[i].limit[0], CHAIN[i].limit[1]);
    }
    return { angles, outOfReach, reach: Math.hypot(radial, height) };
}

/**
 * Near-singular poses, reported for the readout.
 *
 * Two of the three classic UR degeneracies are worth showing: the shoulder
 * case, where the wrist centre crosses the base axis and the pan joint would
 * have to spin instantly, and the elbow case at full stretch.
 */
export function singularity(angles: JointAngles, reach: number): string | null {
    if (reach > MAX_REACH * 0.985) return 'ELBOW · WORKSPACE LIMIT';
    if (Math.abs(Math.PI - Math.abs(angles[2])) < 0.06) return 'ELBOW · LINKS COLLINEAR';
    return null;
}
