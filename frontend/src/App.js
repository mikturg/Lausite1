import { useCallback, useEffect, useRef, useState } from "react";
import "@/App.css";

const PRIMARY_URL = "PRIMARY_URL_PLACEHOLDER";
const INTRO_KEY = "lauofgirly_intro_seen";

const GALLERY = [
    { src: "/g1.jpg", alt: "Portrait doux de Lauofgirly", span: "col-span-2 row-span-2" },
    { src: "/g2.jpg", alt: "Lauofgirly en rose poudré", span: "col-span-1 row-span-1" },
    { src: "/g3.jpg", alt: "Regard espiègle de Lauofgirly", span: "col-span-1 row-span-1" },
    { src: "/g4.jpg", alt: "Lauofgirly, moment coquet", span: "col-span-1 row-span-2" },
    { src: "/g5.jpg", alt: "Sourire de Lauofgirly", span: "col-span-1 row-span-1" },
    { src: "/g6.jpg", alt: "Lauofgirly en lumière douce", span: "col-span-1 row-span-1" },
    { src: "/g7.jpg", alt: "Lauofgirly, grande évasion rose", span: "col-span-2 row-span-1" },
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
            <img src="/bisou-rose.png" alt="" aria-hidden="true" className="cta-kiss" />
            <span>Viens voir</span>
        </a>
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
            setTimeout(() => setFading(true), 2300),
            setTimeout(finish, 2850),
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
            <span className="intro-name font-script">Lauofgirly</span>
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

            <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 pb-10 pt-8 sm:max-w-lg">
                {/* Hero */}
                <div
                    data-testid="hero-portrait"
                    className="relative w-full overflow-hidden rounded-[2.2rem] border border-[#E8B96A]/40 shadow-[0_20px_50px_rgba(74,34,51,0.16)]"
                >
                    <img
                        src="/hero.jpg"
                        alt="Portrait de Lauofgirly"
                        className="aspect-[4/5] w-full object-cover"
                        loading="eager"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#4A2233]/55 via-[#4A2233]/15 to-transparent" />
                    <h1 className="hero-name font-script absolute inset-x-0 bottom-4 text-center text-6xl text-[#FFF4F7]">
                        Lauofgirly
                    </h1>
                </div>

                {/* Tagline */}
                <p
                    data-testid="tagline"
                    className="mb-7 mt-6 max-w-xs text-center text-base font-medium leading-relaxed text-[#4A2233]/80"
                >
                    Ton plus joli détour du jour, rien que pour toi.
                </p>

                {/* Primary CTA */}
                <div className="w-full max-w-xs">
                    <CtaButton testId="cta-button-primary" />
                </div>

                {/* Gallery */}
                <section className="relative mt-12 w-full" aria-label="Galerie de photos">
                    <img
                        src="/bisou-rose.png"
                        alt=""
                        aria-hidden="true"
                        className="kiss-motif"
                    />
                    <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-[#E8B96A]">
                        Un aperçu de mon monde
                    </p>
                    <div
                        data-testid="gallery-grid"
                        className="grid w-full auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px]"
                    >
                        {GALLERY.map((photo, i) => (
                            <button
                                key={photo.src}
                                data-testid={`gallery-item-${i + 1}`}
                                className={`gallery-item ${photo.span}`}
                                onClick={() => setLightboxPhoto(photo)}
                                aria-label={`Agrandir : ${photo.alt}`}
                            >
                                <img src={photo.src} alt={photo.alt} loading="lazy" />
                            </button>
                        ))}
                    </div>
                </section>

                {/* Repeated CTA */}
                <div className="mt-12 w-full max-w-xs">
                    <CtaButton testId="cta-button-secondary" />
                </div>

                {/* Footer */}
                <footer
                    data-testid="footer"
                    className="mt-12 flex w-full flex-col items-center gap-2 border-t border-[#E8B96A]/40 pt-6"
                >
                    <span className="font-script text-2xl text-[#4A2233]/80">Lauofgirly</span>
                    <p className="text-xs text-[#4A2233]/60">
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
