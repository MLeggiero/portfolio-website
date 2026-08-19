import { useEffect, useRef, useState } from 'react';
import type { Object3D } from 'three';
import {
    BASE_MESHES,
    BASE_ROTATION,
    CHAIN,
    MAX_REACH,
    clampToWorkspace,
    singularity,
    solveIK,
    wrapAngle,
    type Vec3,
} from '../data/ur5eKinematics';

/**
 * The hero arm: a UR5e, solved and rendered live.
 *
 * The meshes are the MuJoCo Menagerie visual meshes packed into one meshopt
 * GLB, and the kinematic chain is rebuilt here from `ur5eKinematics` rather
 * than baked into the asset. Nothing is pre-rendered: every frame runs the
 * closed-form IK against the cursor and writes six joint angles.
 *
 * Two things keep this from being a liability on a landing page. three.js is
 * behind a dynamic import so it never enters the main chunk, and both that
 * chunk and the model start downloading as soon as this module is evaluated
 * rather than after React has mounted and run an effect — the browser cannot
 * discover an import that only exists inside a component.
 *
 * Anyone who asked not to see motion gets the arm posed and still: the robot
 * is the hero, so removing the motion should not remove the subject.
 */

const MODEL_URL = `${import.meta.env.BASE_URL}models/ur5e.glb`;

/* ── loading, started as early as the browser will allow ──────── */

type ThreeBundle = [
    typeof import('three'),
    typeof import('three/examples/jsm/loaders/GLTFLoader.js'),
    typeof import('three/examples/jsm/libs/meshopt_decoder.module.js'),
];

let bundlePromise: ThreeBundle extends never ? never : Promise<ThreeBundle> | null = null;
let modelPromise: Promise<ArrayBuffer> | null = null;

function loadBundle() {
    bundlePromise ??= Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js'),
    ]) as Promise<ThreeBundle>;
    return bundlePromise;
}

/**
 * Fetched once as bytes and handed to the parser, rather than letting the
 * loader fetch it. That way the early start is guaranteed to be the only
 * download, instead of depending on the response being cacheable.
 */
function loadModel() {
    modelPromise ??= fetch(MODEL_URL).then((r) => {
        if (!r.ok) throw new Error(`model ${r.status}`);
        return r.arrayBuffer();
    });
    return modelPromise;
}

function canRender3d() {
    try {
        const probe = document.createElement('canvas');
        return !!(probe.getContext('webgl2') || probe.getContext('webgl'));
    } catch {
        return false;
    }
}

// Module scope: this runs while the page is still parsing, so the chunk and
// the mesh are in flight alongside everything else instead of waiting a mount.
if (typeof document !== 'undefined' && canRender3d()) {
    loadBundle();
    loadModel().catch(() => {});
}

/* ── how the cursor maps into the robot's workspace ───────────── */

/** Exponential approach rate for the joints, in 1/s. */
const TRACK_RATE = 3.4;
/** Height the cursor plane is pinned at, roughly the shoulder. */
const TRACK_PLANE_HEIGHT = 0.55;
/** World-space extents the camera keeps in frame, in metres. */
const FRAME_HEIGHT = 1.62;
const FRAME_WIDTH = 1.5;

/**
 * Idle drift, used before the pointer moves and on touch devices. Written in
 * world space rather than in cursor space so it does not depend on where a
 * pointer that never arrived would have been.
 */
function idleTarget(t: number): Vec3 {
    const azimuth = Math.PI / 2 + Math.sin(t * 0.31) * 1.1;
    const radius = 0.58 + 0.08 * Math.sin(t * 0.19);
    return [
        Math.cos(azimuth) * radius,
        Math.sin(azimuth) * radius,
        0.52 + Math.cos(t * 0.23) * 0.3,
    ];
}

const RobotArmCanvas = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const readoutRef = useRef<HTMLDivElement>(null);
    const pointer = useRef({ x: 0, y: 0, active: false });
    const [ready, setReady] = useState(false);
    // 'static' still builds and renders the arm, it just never animates it.
    const [mode, setMode] = useState<'pending' | 'off' | 'static' | 'live'>('pending');

    useEffect(() => {
        if (!canRender3d()) return setMode('off');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setMode(reduced ? 'static' : 'live');
    }, []);

    useEffect(() => {
        if (mode !== 'live' && mode !== 'static') return;
        const mount = mountRef.current;
        if (!mount) return;

        let disposed = false;
        let cleanup: (() => void) | undefined;

        (async () => {
            // Already in flight since module evaluation; this just awaits it.
            const [THREE, { GLTFLoader }, { MeshoptDecoder }] = await loadBundle();
            if (disposed) return;

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.15;
            mount.appendChild(renderer.domElement);

            const scene = new THREE.Scene();

            // Z-up, matching the MJCF the chain came from. Doing it here means
            // no axis conversion has to be smuggled into the kinematics.
            const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
            camera.up.set(0, 0, 1);
            const LOOK_AT = new THREE.Vector3(0, 0, 0.52);
            // Direction is fixed; only the distance along it changes with the
            // viewport, so the framing stays the one that was signed off on.
            const VIEW_DIR = new THREE.Vector3(2.15, -1.62, 1.28).sub(LOOK_AT).normalize();

            /* ── lighting: matte, one clear key, no environment ── */
            scene.add(new THREE.HemisphereLight(0x9fb4ff, 0x05070d, 0.55));

            const key = new THREE.DirectionalLight(0xffffff, 2.1);
            key.position.set(2.4, -2.2, 3.4);
            key.castShadow = true;
            key.shadow.mapSize.set(1024, 1024);
            key.shadow.camera.near = 0.5;
            key.shadow.camera.far = 9;
            key.shadow.camera.left = -1.4;
            key.shadow.camera.right = 1.4;
            key.shadow.camera.top = 1.6;
            key.shadow.camera.bottom = -1.0;
            key.shadow.bias = -0.0012;
            key.shadow.radius = 2.5;
            scene.add(key);

            // Rim light in the site's blue, so the arm sits in the page rather
            // than looking like a screenshot dropped onto it.
            const rim = new THREE.DirectionalLight(0x2c4de4, 2.4);
            rim.position.set(-2.6, 1.4, 1.1);
            scene.add(rim);

            // Catches the contact shadow and nothing else, so the page stays
            // black underneath instead of gaining a grey floor.
            const floor = new THREE.Mesh(
                new THREE.PlaneGeometry(12, 12),
                new THREE.ShadowMaterial({ opacity: 0.55 }),
            );
            floor.receiveShadow = true;
            scene.add(floor);

            /* ── build the kinematic chain ── */
            const loader = new GLTFLoader();
            loader.setMeshoptDecoder(MeshoptDecoder);

            let gltf;
            try {
                const bytes = await loadModel();
                if (disposed) throw new Error('unmounted');
                gltf = await new Promise<Awaited<ReturnType<typeof loader.loadAsync>>>(
                    (resolve, reject) => loader.parse(bytes, '', resolve, reject),
                );
            } catch {
                renderer.dispose();
                if (renderer.domElement.parentNode === mount) {
                    mount.removeChild(renderer.domElement);
                }
                return;
            }
            if (disposed) {
                renderer.dispose();
                return;
            }

            gltf.scene.traverse((o) => {
                const mesh = o as { isMesh?: boolean; castShadow: boolean; receiveShadow: boolean };
                if (mesh.isMesh) {
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                }
            });

            const attach = (parent: Object3D, names: string[]) => {
                for (const name of names) {
                    const node = gltf.scene.getObjectByName(name);
                    // add(), not attach(): the packed meshes carry a
                    // dequantisation transform that has to stay local.
                    if (node) parent.add(node);
                }
            };

            const root = new THREE.Group();
            root.quaternion.set(...BASE_ROTATION);
            scene.add(root);
            attach(root, BASE_MESHES);

            const jointNodes: Object3D[] = [];
            let parent: Object3D = root;
            for (const spec of CHAIN) {
                const fixed = new THREE.Group();
                fixed.name = `${spec.name}_fixed`;
                fixed.position.set(...spec.translation);
                fixed.quaternion.set(...spec.rotation);
                parent.add(fixed);

                const joint = new THREE.Group();
                joint.name = spec.name;
                fixed.add(joint);
                attach(joint, spec.meshes);

                jointNodes.push(joint);
                parent = joint;
            }

            /* ── pointer ── */
            // Stored as normalised device coords, y up, because the target is
            // found by casting the cursor into the scene rather than by
            // mapping screen axes onto joint angles by hand. Hand-mapping is
            // what made some directions come out inverted: which way the arm
            // appears to move depends on where the camera is standing.
            const onPointer = (e: PointerEvent) => {
                const rect = mount.getBoundingClientRect();
                pointer.current = {
                    x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                    y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
                    active: true,
                };
            };
            const onLeave = () => {
                pointer.current.active = false;
            };
            if (mode === 'live') {
                window.addEventListener('pointermove', onPointer, { passive: true });
                window.addEventListener('pointerleave', onLeave);
            }

            /* ── framing ── */
            const resize = () => {
                const w = mount.clientWidth;
                const h = mount.clientHeight;
                if (!w || !h) return;
                renderer.setSize(w, h);
                const aspect = w / h;
                camera.aspect = aspect;

                // Back off far enough that the arm fits in whichever dimension
                // is tighter. Without this a phone in portrait, where width is
                // the constraint, gets a robot the size of the screen.
                const halfFov = (camera.fov * Math.PI) / 360;
                const distance = Math.max(
                    FRAME_HEIGHT / (2 * Math.tan(halfFov)),
                    FRAME_WIDTH / (2 * Math.tan(halfFov) * aspect),
                );
                camera.position.copy(VIEW_DIR).multiplyScalar(distance).add(LOOK_AT);
                camera.lookAt(LOOK_AT);
                camera.updateProjectionMatrix();

                // Resizing reallocates and clears the drawing buffer. With no
                // animation loop running — the reduced-motion case — nothing
                // would ever redraw it, leaving an empty hero.
                renderer.render(scene, camera);
            };
            resize();
            const ro = new ResizeObserver(resize);
            ro.observe(mount);

            /* ── frame loop ── */
            const raycaster = new THREE.Raycaster();
            const trackPlane = new THREE.Plane();
            const planeAnchor = new THREE.Vector3(0, 0, TRACK_PLANE_HEIGHT);
            const facing = new THREE.Vector3();
            const hit = new THREE.Vector3();
            const ndc = new THREE.Vector2();

            /** Where the cursor is, in the robot's own coordinates. */
            const pointerTarget = (): Vec3 | null => {
                ndc.set(pointer.current.x, pointer.current.y);
                camera.getWorldDirection(facing);
                trackPlane.setFromNormalAndCoplanarPoint(facing, planeAnchor);
                raycaster.setFromCamera(ndc, camera);
                if (!raycaster.ray.intersectPlane(trackPlane, hit)) return null;
                return clampToWorkspace([hit.x, hit.y, hit.z]);
            };

            const angles = [0, -1.3, 1.5, -1.75, 0, 0];
            const AXIS = { x: 'x', y: 'y', z: 'z' } as const;
            let raf = 0;
            let last = performance.now();
            let elapsed = 0;
            let readoutAt = 0;

            const frame = (now: number) => {
                const dt = Math.min((now - last) / 1000, 0.05);
                last = now;
                elapsed += dt;

                const target =
                    (pointer.current.active ? pointerTarget() : null) ??
                    clampToWorkspace(idleTarget(elapsed));

                const solved = solveIK(target);
                // Frame-rate independent smoothing, taking the short way round
                // so a joint crossing ±π eases across instead of unwinding.
                const k = 1 - Math.exp(-TRACK_RATE * dt);
                for (let i = 0; i < angles.length; i++) {
                    angles[i] += wrapAngle(solved.angles[i] - angles[i]) * k;
                    jointNodes[i].rotation[AXIS[CHAIN[i].axis]] = angles[i];
                }

                if (now - readoutAt > 90) {
                    readoutAt = now;
                    writeReadout(solved.reach);
                }

                renderer.render(scene, camera);
                raf = requestAnimationFrame(frame);
            };

            const writeReadout = (reach: number) => {
                if (readoutRef.current) {
                    const flag = singularity(angles, reach);
                    readoutRef.current.innerHTML =
                        CHAIN.map(
                            (_j, i) =>
                                `<span class="opacity-50">θ${i + 1}</span> ${((angles[i] * 180) / Math.PI)
                                    .toFixed(1)
                                    .padStart(7)}°`,
                        ).join('<br/>') +
                        `<br/><span class="opacity-50">r</span> ${((reach / MAX_REACH) * 100)
                            .toFixed(0)
                            .padStart(6)}%` +
                        (flag ? `<br/><span class="text-red-500/80">${flag}</span>` : '');
                }
            };

            // Pose and paint one frame before announcing readiness, so the
            // fade-in never runs against a blank canvas.
            const settled = solveIK(clampToWorkspace(idleTarget(0)));
            for (let i = 0; i < angles.length; i++) {
                angles[i] = settled.angles[i];
                jointNodes[i].rotation[AXIS[CHAIN[i].axis]] = angles[i];
            }
            writeReadout(settled.reach);
            renderer.render(scene, camera);
            setReady(true);

            if (mode === 'live') raf = requestAnimationFrame(frame);

            cleanup = () => {
                cancelAnimationFrame(raf);
                ro.disconnect();
                window.removeEventListener('pointermove', onPointer);
                window.removeEventListener('pointerleave', onLeave);
                scene.traverse((o) => {
                    const m = o as {
                        geometry?: { dispose(): void };
                        material?: { dispose(): void } | { dispose(): void }[];
                    };
                    m.geometry?.dispose();
                    if (Array.isArray(m.material)) m.material.forEach((x) => x.dispose());
                    else m.material?.dispose();
                });
                renderer.dispose();
                if (renderer.domElement.parentNode === mount) {
                    mount.removeChild(renderer.domElement);
                }
            };
        })();

        return () => {
            disposed = true;
            cleanup?.();
        };
    }, [mode]);

    return (
        <>
            {mode !== 'off' && (
                <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{ opacity: ready ? 1 : 0, zIndex: 0 }}
                >
                    <div
                        ref={mountRef}
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                    />
                </div>
            )}

            {mode !== 'off' && (
                <div
                    ref={readoutRef}
                    aria-hidden="true"
                    className="absolute bottom-8 right-8 z-[1] hidden md:block font-mono text-[10px]
                               leading-relaxed text-primary/80 whitespace-pre transition-opacity duration-700"
                    style={{ opacity: ready ? 1 : 0 }}
                />
            )}
        </>
    );
};

export default RobotArmCanvas;
