import { useEffect, useRef } from "react";

export default function CherriesCharm({ className = "" }) {
    const hostRef = useRef(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let cancelled = false;
        let cleanup = () => {};

        (async () => {
            try {
                const THREE = await import("three");
                const { GLTFLoader } = await import(
                    "three/examples/jsm/loaders/GLTFLoader.js"
                );
                if (cancelled) return;

                const size = host.clientWidth || 100;
                const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                renderer.setSize(size, size);
                renderer.setClearColor(0x000000, 0);
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1.15;

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

                // Bright, warm, wraparound lighting: nothing falls to black
                scene.add(new THREE.AmbientLight(0xfff0ea, 0.85));
                scene.add(new THREE.HemisphereLight(0xfff8f0, 0xf2d4dc, 1.5));
                const key = new THREE.DirectionalLight(0xfff2df, 2.6);
                key.position.set(2.5, 3, 4);
                scene.add(key);
                const fill = new THREE.DirectionalLight(0xffdfe9, 1.15);
                fill.position.set(-3, 0.5, -2.5);
                scene.add(fill);

                const gltf = await new GLTFLoader().loadAsync("/cherries.glb");
                if (cancelled) {
                    renderer.dispose();
                    return;
                }

                // Wrap in an identity pivot: recentre the model inside it by pure
                // translation, then scale/rotate only the pivot, so the model's own
                // baked transforms can't shift it off the rotation axis.
                const inner = gltf.scene;
                // Brighten and saturate the materials (texture itself untouched),
                // keep glossy highlights under ACES so they roll off, not blow out
                inner.traverse((obj) => {
                    if (!obj.isMesh || !obj.material) return;
                    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                    mats.forEach((m) => {
                        if (!m.isMeshStandardMaterial) return;
                        m.metalness = 0;
                        m.roughness = Math.min(m.roughness ?? 1, 0.55);
                        m.onBeforeCompile = (shader) => {
                            shader.fragmentShader = shader.fragmentShader.replace(
                                "#include <map_fragment>",
                                `#include <map_fragment>
                                float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
                                diffuseColor.rgb = mix(vec3(lum), diffuseColor.rgb, 1.4) * 1.12;`
                            );
                        };
                        m.needsUpdate = true;
                    });
                });
                const pivot = new THREE.Group();
                pivot.add(inner);
                const box = new THREE.Box3().setFromObject(pivot);
                const sphere = box.getBoundingSphere(new THREE.Sphere());
                inner.position.sub(sphere.center);
                pivot.scale.setScalar(1 / (sphere.radius || 1));
                scene.add(pivot);

                // Fit the full bounding sphere with padding so the silhouette
                // stays inside the frustum at every rotation angle.
                const fitDistance =
                    1 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
                camera.position.set(0, 0, fitDistance * 1.05);
                camera.lookAt(0, 0, 0);
                host.appendChild(renderer.domElement);

                let raf = 0;
                let running = false;
                let angle = 0;
                let last = 0;
                let vel = 0;
                let isDragging = false;
                let lastX = 0;
                let lastMoveT = 0;
                const AUTO = (Math.PI * 2) / 9000;
                const DRAG_K = 0.009;

                const render = () => renderer.render(scene, camera);
                const loop = (now) => {
                    const dt = last ? now - last : 0;
                    last = now;
                    if (!isDragging && !reduced) {
                        // throw momentum eases down, then blends into the auto loop
                        vel += (AUTO - vel) * Math.min(1, dt / 600);
                        angle += vel * dt;
                    }
                    pivot.rotation.y = angle;
                    render();
                    raf = requestAnimationFrame(loop);
                };
                const setRunning = (on) => {
                    if (on && !running) {
                        running = true;
                        last = 0;
                        raf = requestAnimationFrame(loop);
                    } else if (!on && running) {
                        running = false;
                        cancelAnimationFrame(raf);
                    }
                };

                // Drag to spin: pointer events cover mouse, touch and pen.
                // touch-action: pan-y keeps vertical swipes scrolling the page.
                host.style.touchAction = "pan-y";
                host.style.cursor = "grab";
                const onDown = (e) => {
                    isDragging = true;
                    lastX = e.clientX;
                    lastMoveT = performance.now();
                    vel = 0;
                    host.style.cursor = "grabbing";
                    host.setPointerCapture(e.pointerId);
                };
                const onMove = (e) => {
                    if (!isDragging) return;
                    const now = performance.now();
                    const dx = e.clientX - lastX;
                    const dt = now - lastMoveT || 16;
                    lastX = e.clientX;
                    lastMoveT = now;
                    const delta = dx * DRAG_K;
                    angle += delta;
                    vel = vel * 0.75 + (delta / dt) * 0.25;
                    pivot.rotation.y = angle;
                    if (reduced) render();
                };
                const onUp = () => {
                    isDragging = false;
                    host.style.cursor = "grab";
                };
                host.addEventListener("pointerdown", onDown);
                host.addEventListener("pointermove", onMove);
                host.addEventListener("pointerup", onUp);
                host.addEventListener("pointercancel", onUp);

                const io = new IntersectionObserver(([entry]) =>
                    setRunning(!reduced && entry.isIntersecting)
                );
                io.observe(host);

                // Keep the canvas matched to its box: it must never overflow
                // (viewport resizes, orientation changes, late layout).
                const applySize = () => {
                    const s = host.clientWidth || 100;
                    renderer.setSize(s, s);
                    render();
                };
                const ro = new ResizeObserver(applySize);
                ro.observe(host);
                applySize();

                cleanup = () => {
                    io.disconnect();
                    ro.disconnect();
                    cancelAnimationFrame(raf);
                    host.removeEventListener("pointerdown", onDown);
                    host.removeEventListener("pointermove", onMove);
                    host.removeEventListener("pointerup", onUp);
                    host.removeEventListener("pointercancel", onUp);
                    renderer.dispose();
                    renderer.domElement.remove();
                };
            } catch {
                /* WebGL unavailable or model failed: leave the space empty */
            }
        })();

        return () => {
            cancelled = true;
            cleanup();
        };
    }, []);

    return (
        <div
            ref={hostRef}
            data-testid="cherries-charm"
            aria-hidden="true"
            className={className}
        />
    );
}
