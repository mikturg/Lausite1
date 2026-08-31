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

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

                scene.add(new THREE.HemisphereLight(0xfff6ec, 0xf7cad9, 1.1));
                const key = new THREE.DirectionalLight(0xfff1de, 1.3);
                key.position.set(2.5, 3, 4);
                scene.add(key);

                const gltf = await new GLTFLoader().loadAsync("/cherries.glb");
                if (cancelled) {
                    renderer.dispose();
                    return;
                }

                // Wrap in an identity pivot: recentre the model inside it by pure
                // translation, then scale/rotate only the pivot, so the model's own
                // baked transforms can't shift it off the rotation axis.
                const inner = gltf.scene;
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
                const render = () => renderer.render(scene, camera);
                const loop = (now) => {
                    if (last) angle += ((now - last) / 9000) * Math.PI * 2;
                    last = now;
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
