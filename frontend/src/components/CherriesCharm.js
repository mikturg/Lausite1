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

                const group = gltf.scene;
                const box = new THREE.Box3().setFromObject(group);
                const sphere = box.getBoundingSphere(new THREE.Sphere());
                const scale = 1 / (sphere.radius || 1);
                group.scale.setScalar(scale);
                group.position.sub(sphere.center.clone().multiplyScalar(scale));
                scene.add(group);

                // Fit the full bounding sphere with padding so the silhouette
                // stays inside the frustum at every rotation angle.
                const fitDistance =
                    1 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
                camera.position.set(0, 0, fitDistance * 1.22);
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
                    group.rotation.y = angle;
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
                render();

                cleanup = () => {
                    io.disconnect();
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
