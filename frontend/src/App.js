import { useCallback, useEffect, useRef, useState } from "react";
import "@/App.css";
import NAME_PATHS from "@/namePaths.json";

const PRIMARY_URL = "PRIMARY_URL_PLACEHOLDER";
const INTRO_KEY = "lauofgirly_intro_seen";

const GALLERY = [
    { src: "/g1.jpg", alt: "Lauofgirly en sweat rose" },
    { src: "/g6.jpg", alt: "Lauofgirly devant le miroir" },
    { src: "/g7.jpg", alt: "Sourire espiègle de Lauofgirly" },
    { src: "/g2.jpg", alt: "Lauofgirly en rose poudré" },
];

function CtaButton({ testId }) {
    const handleClick = (e) => {
        if (PRIMARY_URL === "PRIMARY_URL_PLACEHOLDER") {
            e.preventDefault();
        }
    };

    return (
        <a
            data-testid={testId}
            className="cta-button"
            href={PRIMARY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
        >
            <span>Viens voir</span>
        </a>
    );
}

const WRITE_START_MS = 950;
const WRITE_WINDOW_MS = 1800;

function HandwrittenName() {
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const paths = Array.from(svg.querySelectorAll("path"));
        const lengths = paths.map((p) => p.getTotalLength());
        const total = lengths.reduce((a, b) => a + b, 0);
        paths.forEach((p, i) => {
            p.style.strokeDasharray = `${lengths[i]}`;
            p.style.strokeDashoffset = `${lengths[i]}`;
        });
        const raf = requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                let acc = 0;
                paths.forEach((p, i) => {
                    const dur = Math.max(90, (WRITE_WINDOW_MS * lengths[i]) / total);
                    const delay = WRITE_START_MS + acc;
                    acc += dur;
                    p.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(0.55, 0, 0.35, 1) ${delay}ms, fill-opacity 380ms ease ${WRITE_START_MS + WRITE_WINDOW_MS}ms`;
                    p.style.strokeDashoffset = "0";
                    p.style.fillOpacity = "1";
                });
            })
        );
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <svg
            ref={svgRef}
            data-testid="intro-name-svg"
            className="intro-name-svg"
            viewBox={NAME_PATHS.viewBox}
            role="img"
            aria-label="Lauofgirly"
        >
            {NAME_PATHS.paths.map((d, i) => (
                <path key={i} d={d} strokeWidth={NAME_PATHS.strokeWidth} />
            ))}
        </svg>
    );
}

function Intro({ onDone }) {
    const [fading, setFading] = useState(false);
    const timers = useRef([]);

    const finish = useCallback(() => {
        sessionStorage.setItem(INTRO_KEY, "1");
        onDone();
    }, [onDone]);

    const skip = useCallback(() => {
        timers.current.forEach(clearTimeout);
        finish();
    }, [finish]);

    useEffect(() => {
        timers.current = [
            setTimeout(() => setFading(true), 3150),
            setTimeout(finish, 3650),
        ];
        return () => timers.current.forEach(clearTimeout);
    }, [finish]);

    return (
        <div
            data-testid="intro-overlay"
            className={`intro-overlay intro-playing ${fading ? "intro-fading" : ""}`}
            onClick={skip}
            role="button"
            aria-label="Passer l'introduction"
        >
            <img src="/bisou-rose.png" alt="" aria-hidden="true" className="intro-kiss" />
            <HandwrittenName />
        </div>
    );
}

function Lightbox({ photo, onClose }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div
            data-testid="lightbox-modal"
            className="lightbox-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={photo.alt}
        >
            <button
                data-testid="lightbox-close-button"
                className="lightbox-close"
                onClick={onClose}
                aria-label="Fermer la photo"
            >
                ✕
            </button>
            <img
                src={photo.src}
                alt={photo.alt}
                className="lightbox-image"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

export default function App() {
    const [showIntro, setShowIntro] = useState(false);
    const [lightboxPhoto, setLightboxPhoto] = useState(null);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const seen = sessionStorage.getItem(INTRO_KEY);
        if (!reduced && !seen) {
            setShowIntro(true);
        }
    }, []);

    return (
        <div
            data-testid="lauofgirly-page"
            className="min-h-screen bg-[#FFF4F7] text-[#4A2233] selection:bg-[#F7CAD9]"
        >
            {showIntro && <Intro onDone={() => setShowIntro(false)} />}

            <main className="flex min-h-screen w-full flex-col">
                {/* Hero — full bleed on mobile, contained on larger screens */}
                <header
                    data-testid="hero-portrait"
                    className="lg:grid lg:min-h-[100svh] lg:grid-cols-[45%_55%] lg:items-center"
                >
                    <div className="md:mx-auto md:max-w-md md:pt-12 lg:flex lg:h-full lg:max-w-none lg:items-center lg:justify-center lg:pt-0">
                        <div className="relative lg:w-fit">
                            <img
                                src="/hero.jpg"
                                alt="Portrait de Lauofgirly"
                                className="h-[78svh] min-h-[480px] w-full object-cover object-[center_20%] md:h-auto md:min-h-0 md:object-contain lg:h-[86svh] lg:w-auto lg:max-w-[92%]"
                                loading="eager"
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent to-[#FFF4F7] lg:h-1/5" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/5 bg-gradient-to-l from-[#FFF4F7]/90 to-transparent lg:block" />
                            <h1 className="hero-name font-script absolute inset-x-0 bottom-0 translate-y-[38%] text-center text-7xl text-[#4A2233] md:translate-y-[30%] lg:hidden">
                                Lauofgirly
                            </h1>
                        </div>
                    </div>
                    <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-9 lg:px-16">
                        <h1 className="font-script text-center text-8xl leading-tight text-[#4A2233] xl:text-9xl">
                            Lauofgirly
                        </h1>
                        <p
                            data-testid="tagline-desktop"
                            className="max-w-sm text-center text-lg font-medium leading-relaxed text-[#4A2233]/75"
                        >
                            Ton plus joli détour du jour, rien que pour toi.
                        </p>
                        <div className="w-full max-w-xs">
                            <CtaButton testId="cta-button-primary-desktop" />
                        </div>
                    </div>
                </header>

                {/* Tagline + first CTA (mobile / tablet) */}
                <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 md:mt-12 lg:hidden">
                    <p
                        data-testid="tagline"
                        className="mt-16 max-w-xs text-center text-base font-medium leading-relaxed text-[#4A2233]/80"
                    >
                        Ton plus joli détour du jour, rien que pour toi.
                    </p>
                    <div className="mt-10 w-full max-w-xs">
                        <CtaButton testId="cta-button-primary" />
                    </div>
                </div>

                {/* Gallery — horizontal strip */}
                <section
                    className="relative mt-32 w-full overflow-hidden"
                    aria-label="Galerie de photos"
                >
                    <img
                        src="/bisou-rose.png"
                        alt=""
                        aria-hidden="true"
                        className="kiss-watermark"
                    />
                    <div className="relative mx-auto flex w-full max-w-md flex-col items-center px-6">
                        <div className="hairline" />
                        <p className="section-label mt-6 text-center">
                            Un aperçu de mon monde
                        </p>
                    </div>
                    <div className="relative mx-auto mt-12 w-full max-w-md sm:max-w-xl lg:max-w-3xl">
                        <div
                            data-testid="gallery-strip"
                            className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[7vw] sm:px-8"
                        >
                        {GALLERY.map((photo, i) => (
                            <button
                                key={photo.src}
                                data-testid={`gallery-item-${i + 1}`}
                                className="strip-card aspect-[3/4] w-[72vw] sm:w-[320px]"
                                onClick={() => setLightboxPhoto(photo)}
                                aria-label={`Agrandir : ${photo.alt}`}
                            >
                                <img src={photo.src} alt={photo.alt} loading="lazy" />
                            </button>
                        ))}
                        </div>
                    </div>
                </section>

                {/* Repeated CTA */}
                <div className="mx-auto mt-32 w-full max-w-xs px-6">
                    <CtaButton testId="cta-button-secondary" />
                </div>

                {/* Footer */}
                <footer
                    data-testid="footer"
                    className="mx-auto mt-28 flex w-full max-w-md flex-col items-center px-6 pb-12"
                >
                    <div className="hairline" />
                    <span className="font-script mt-10 text-3xl text-[#4A2233]/80">
                        Lauofgirly
                    </span>
                    <p className="mt-3 text-xs text-[#4A2233]/55">
                        © 2026 Lauofgirly · Tout doux, tout rose
                    </p>
                </footer>
            </main>

            {lightboxPhoto && (
                <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
            )}
        </div>
    );
}
