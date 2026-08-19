import { useEffect, useRef, useState } from 'react';
import type { Object3D } from 'three';
import BlueprintCanvas from './BlueprintCanvas';
import {
    BASE_MESHES,
    BASE_ROTATION,
    CHAIN,
    MAX_REACH,
    clamp,
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
 * Three things keep this from being a liability on a landing page. It is
 * behind a dynamic import, so three.js is not in the main chunk. It only
 * mounts after the 2D canvas has already painted, so first paint never waits
 * on a mesh download. And anyone who asked not to see motion, or whose browser
 * has no WebGL, keeps the 2D canvas instead.
 */

const MODEL_URL = `${import.meta.env.BASE_URL}models/ur5e.glb`;

/* ── how the cursor maps into the robot's workspace ───────────── */

/** Half the yaw the base sweeps across the viewport. */
const SWING = 0.95;
/** The arm faces the camera; this is where its plane points at rest. */
const HEADING = Math.PI / 2;
const TARGET_RADIUS = 0.56;
const TARGET_Z_LOW = 0.12;
const TARGET_Z_HIGH = 0.95;
/** Exponential approach rate for the joints, in 1/s. */
const TRACK_RATE = 3.4;

/** Cursor position in normalised device coords to a point the arm can hit. */
function targetFromPointer(nx: number, ny: number): Vec3 {
    const azimuth = HEADING + clamp(nx, -1, 1) * SWING;
    const z = TARGET_Z_LOW + (TARGET_Z_HIGH - TARGET_Z_LOW) * clamp((1 - ny) / 2, 0, 1);
    // Reach further out toward the edges so the arm extends rather than just
    // swivelling, but never far enough to hit the workspace boundary.
    const radius = TARGET_RADIUS + 0.1 * Math.abs(clamp(nx, -1, 1));
    return [Math.cos(azimuth) * radius, Math.sin(azimuth) * radius, z];
}

/** Idle drift, used before the pointer moves and on touch devices. */
function idleTarget(t: number): Vec3 {
    return targetFromPointer(Math.sin(t * 0.31) * 0.75, Math.cos(t * 0.23) * 0.6);
}

function hasWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
        return false;
    }
}

const RobotArmCanvas = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const readoutRef = useRef<HTMLDivElement>(null);
    const pointer = useRef({ x: 0, y: 0, active: false });
    const [ready, setReady] = useState(false);
    const [use3d, setUse3d] = useState(false);
    const [showFallback, setShowFallback] = useState(true);

    // Drop the 2D canvas once it has finished fading behind the arm.
    useEffect(() => {
        if (!ready) return;
        const id = window.setTimeout(() => setShowFallback(false), 1300);
        return () => window.clearTimeout(id);
    }, [ready]);

    // Decide once, on the client, whether the 3D arm is appropriate at all.
    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setUse3d(!reduced && hasWebGL());
    }, []);

    useEffect(() => {
        if (!use3d) return;
        const mount = mountRef.current;
        if (!mount) return;

        let disposed = false;
        let cleanup: (() => void) | undefined;

        (async () => {
            const THREE = await import('three');
            const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
            const { MeshoptDecoder } = await import(
                'three/examples/jsm/libs/meshopt_decoder.module.js'
            );
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
            camera.position.set(2.15, -1.62, 1.28);
            camera.lookAt(0, 0, 0.52);

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
                gltf = await loader.loadAsync(MODEL_URL);
            } catch {
                renderer.dispose();
                mount.removeChild(renderer.domElement);
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
            const onPointer = (e: PointerEvent) => {
                pointer.current = {
                    x: (e.clientX / window.innerWidth) * 2 - 1,
                    y: (e.clientY / window.innerHeight) * 2 - 1,
                    active: true,
                };
            };
            const onLeave = () => {
                pointer.current.active = false;
            };
            window.addEventListener('pointermove', onPointer, { passive: true });
            window.addEventListener('pointerleave', onLeave);

            /* ── framing ── */
            const resize = () => {
                const w = mount.clientWidth;
                const h = mount.clientHeight;
                if (!w || !h) return;
                renderer.setSize(w, h);
                camera.aspect = w / h;
                // On wide screens bias the arm off-centre so it shares the
                // hero with the name instead of sitting behind it.
                // Nudge the arm off dead centre on wide screens; it still
                // sits behind the name, which is the point of it.
                if (w > 900) {
                    camera.setViewOffset(w, h, -w * 0.17, h * 0.03, w, h);
                } else {
                    camera.clearViewOffset();
                }
                camera.updateProjectionMatrix();
            };
            resize();
            const ro = new ResizeObserver(resize);
            ro.observe(mount);

            /* ── frame loop ── */
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

                const target = pointer.current.active
                    ? targetFromPointer(pointer.current.x, pointer.current.y)
                    : idleTarget(elapsed);

                const solved = solveIK(target);
                // Frame-rate independent smoothing, taking the short way round
                // so a joint crossing ±π eases across instead of unwinding.
                const k = 1 - Math.exp(-TRACK_RATE * dt);
                for (let i = 0; i < angles.length; i++) {
                    angles[i] += wrapAngle(solved.angles[i] - angles[i]) * k;
                    jointNodes[i].rotation[AXIS[CHAIN[i].axis]] = angles[i];
                }

                if (now - readoutAt > 90 && readoutRef.current) {
                    readoutAt = now;
                    const flag = singularity(angles, solved.reach);
                    readoutRef.current.innerHTML =
                        CHAIN.map(
                            (_j, i) =>
                                `<span class="opacity-50">θ${i + 1}</span> ${((angles[i] * 180) / Math.PI)
                                    .toFixed(1)
                                    .padStart(7)}°`,
                        ).join('<br/>') +
                        `<br/><span class="opacity-50">r</span> ${(solved.reach / MAX_REACH * 100)
                            .toFixed(0)
                            .padStart(6)}%` +
                        (flag ? `<br/><span class="text-red-500/80">${flag}</span>` : '');
                }

                renderer.render(scene, camera);
                raf = requestAnimationFrame(frame);
            };
            raf = requestAnimationFrame(frame);
            setReady(true);

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
    }, [use3d]);

    return (
        <>
            {/* Paints immediately, then hands over. It is dropped once the
                cross-fade is done rather than left at opacity zero, so the
                page is not running a second animation loop forever. */}
            {showFallback && (
                <div
                    className="absolute inset-0 transition-opacity duration-[1200ms]"
                    style={{ opacity: ready ? 0 : 1 }}
                >
                    <BlueprintCanvas />
                </div>
            )}

            {use3d && (
                <div
                    className="absolute inset-0 transition-opacity duration-[1200ms]"
                    style={{ opacity: ready ? 1 : 0, zIndex: 0 }}
                >
                    <div
                        ref={mountRef}
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                    />
                </div>
            )}

            {use3d && (
                <div
                    ref={readoutRef}
                    aria-hidden="true"
                    className="absolute bottom-8 right-8 z-[1] hidden md:block font-mono text-[10px]
                               leading-relaxed text-primary/80 whitespace-pre transition-opacity duration-1000"
                    style={{ opacity: ready ? 1 : 0 }}
                />
            )}
        </>
    );
};

export default RobotArmCanvas;
