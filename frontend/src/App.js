import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CherriesCharm from "@/components/CherriesCharm";
import "@/App.css";
import NAME_PATHS from "@/namePaths.json";

const PRIMARY_URL = "PRIMARY_URL_PLACEHOLDER";
const SECOND_SITE_URL = "SECOND_SITE_URL_PLACEHOLDER";

const GALLERY = [
    { src: "/g1.jpg", alt: "Lauofgirly en sweat rose" },
    { src: "/g6.jpg", alt: "Lauofgirly devant le miroir" },
    { src: "/g7.jpg", alt: "Sourire espiègle de Lauofgirly" },
    { src: "/g5.jpg", alt: "Lauofgirly, miroir et sourire" },
    { src: "/g3.jpg", alt: "Lauofgirly en blanc, espiègle" },
];

// Single shared gap above and below the cherries — they can't drift apart.
const CHERRY_GAP = "mt-5 lg:mt-6";

function GalleryStrip({ onOpen }) {
    const stripRef = useRef(null);
    const dragState = useRef({ startX: 0, scrollLeft: 0, moved: false, active: false });
    const autoState = useRef({ hovering: false, pauseUntil: 0, visible: true });
    const [dragging, setDragging] = useState(false);
    const draggingRef = useRef(false);

    const PHOTOS = [...GALLERY, ...GALLERY, ...GALLERY];

    useEffect(() => {
        const el = stripRef.current;
        if (!el) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const setWidth = () => el.scrollWidth / 3;
        el.scrollLeft = setWidth();
        // Float accumulator: some browsers (older Safari) round scrollLeft to
        // integers, so `+= 0.5px/frame` would never accumulate. We track the
        // position ourselves and write absolute values instead.
        let pos = el.scrollLeft;

        const wrap = () => {
            const sw = setWidth();
            if (el.scrollLeft >= sw * 2) {
                el.scrollLeft -= sw;
                if (dragState.current.active) dragState.current.scrollLeft -= sw;
            } else if (el.scrollLeft < sw) {
                el.scrollLeft += sw;
                if (dragState.current.active) dragState.current.scrollLeft += sw;
            }
        };

        let raf = 0;
        let last = 0;
        const SPEED = 60; // px per second, gentle drift
        const tick = (now) => {
            const dt = last ? now - last : 0;
            last = now;
            const a = autoState.current;
            if (
                !reduced &&
                a.visible &&
                !a.hovering &&
                !draggingRef.current &&
                now > a.pauseUntil
            ) {
                const sw = setWidth();
                pos += (SPEED * dt) / 1000;
                if (pos >= sw * 2) pos -= sw;
                else if (pos < sw) pos += sw;
                el.scrollLeft = pos;
            } else {
                pos = el.scrollLeft;
            }
            wrap();
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        const onWheel = (e) => {
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
            const maxScroll = el.scrollWidth - el.clientWidth;
            if (
                (e.deltaY > 0 && el.scrollLeft < maxScroll - 1) ||
                (e.deltaY < 0 && el.scrollLeft > 1)
            ) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
                autoState.current.pauseUntil = performance.now() + 1500;
            }
        };
        const onEnter = (e) => {
            if (e.pointerType === "mouse") autoState.current.hovering = true;
        };
        const onLeave = () => {
            autoState.current.hovering = false;
        };
        const io = new IntersectionObserver(([entry]) => {
            autoState.current.visible = entry.isIntersecting;
        });
        io.observe(el);

        el.addEventListener("wheel", onWheel, { passive: false });
        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);
        window.addEventListener("resize", wrap);
        return () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            el.removeEventListener("wheel", onWheel);
            el.removeEventListener("pointerenter", onEnter);
            el.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("resize", wrap);
        };
    }, []);

    const onPointerDown = (e) => {
        if (e.pointerType === "touch") return;
        const el = stripRef.current;
        dragState.current = {
            startX: e.clientX,
            scrollLeft: el.scrollLeft,
            moved: false,
            active: true,
        };
        draggingRef.current = true;
        setDragging(true);
    };

    useEffect(() => {
        if (!dragging) return;
        const onMove = (e) => {
            const dx = e.clientX - dragState.current.startX;
            if (Math.abs(dx) > 6) dragState.current.moved = true;
            stripRef.current.scrollLeft = dragState.current.scrollLeft - dx;
        };
        const onUp = () => {
            dragState.current.active = false;
            draggingRef.current = false;
            autoState.current.pauseUntil = performance.now() + 1500;
            setDragging(false);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
    }, [dragging]);

    const scrollByCard = (dir) => {
        autoState.current.pauseUntil = performance.now() + 1500;
        stripRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
    };

    const handleCardClick = (photo) => {
        if (dragState.current.moved) {
            dragState.current.moved = false;
            return;
        }
        onOpen(photo);
    };

    const arrowBase =
        "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8B96A]/60 bg-[#FFF4F7] text-[#4A2233] shadow-[0_6px_18px_rgba(74,34,51,0.12)] transition-colors duration-200 hover:bg-[#F7CAD9] md:flex";

    return (
        <div className="relative mx-auto w-full max-w-md sm:max-w-xl lg:max-w-3xl">
            <button
                data-testid="gallery-arrow-prev"
                aria-label="Photos précédentes"
                onClick={() => scrollByCard(-1)}
                className={`${arrowBase} left-3`}
            >
                <ChevronLeft size={20} />
            </button>
            <button
                data-testid="gallery-arrow-next"
                aria-label="Photos suivantes"
                onClick={() => scrollByCard(1)}
                className={`${arrowBase} right-3`}
            >
                <ChevronRight size={20} />
            </button>
            <div
                ref={stripRef}
                data-testid="gallery-strip"
                className={`no-scrollbar flex select-none gap-5 overflow-x-auto px-[7vw] sm:px-8 md:cursor-grab ${
                    dragging ? "md:cursor-grabbing" : ""
                }`}
                onPointerDown={onPointerDown}
            >
                {PHOTOS.map((photo, i) => (
                    <button
                        key={`${photo.src}-${i}`}
                        data-testid={`gallery-item-${i + 1}`}
                        className="strip-card aspect-[3/4] w-[72vw] sm:w-[320px]"
                        onClick={() => handleCardClick(photo)}
                        aria-label={`Agrandir : ${photo.alt}`}
                        tabIndex={-1}
                    >
                        <img src={photo.src} alt={photo.alt} loading="lazy" draggable={false} />
                    </button>
                ))}
            </div>
        </div>
    );
}

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

const WRITE_START_MS = 1700;
const WRITE_WINDOW_MS = 2600;

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
                    p.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(0.45, 0, 0.25, 1) ${delay}ms, fill-opacity 400ms ease ${WRITE_START_MS + WRITE_WINDOW_MS}ms`;
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
        onDone();
    }, [onDone]);

    const skip = useCallback(() => {
        timers.current.forEach(clearTimeout);
        finish();
    }, [finish]);

    useEffect(() => {
        const onKey = () => skip();
        window.addEventListener("keydown", onKey);
        timers.current = [
            setTimeout(() => setFading(true), 5000),
            setTimeout(finish, 5600),
        ];
        return () => {
            window.removeEventListener("keydown", onKey);
            timers.current.forEach(clearTimeout);
        };
    }, [finish, skip]);

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
    const heroImgColRef = useRef(null);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduced) {
            setShowIntro(true);
        }
    }, []);

    // Scroll reveals: each marked section fades/rises once, then stays
    useEffect(() => {
        const els = Array.from(document.querySelectorAll("[data-reveal]"));
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    // Gentle parallax: the portrait lags the page by a few pixels
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const el = heroImgColRef.current;
        if (!el) return;
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el.style.transform = `translate3d(0, ${Math.min(window.scrollY * 0.12, 48)}px, 0)`;
            });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div
            data-testid="lauofgirly-page"
            className="relative min-h-screen overflow-x-clip bg-[#FFF4F7] text-[#4A2233] selection:bg-[#F7CAD9]"
        >
            {showIntro && <Intro onDone={() => setShowIntro(false)} />}

            {/* Atmosphere layers */}
            <div className="gradient-drift" aria-hidden="true" />
            <div className="grain-overlay" aria-hidden="true" />
            <img
                src="/bisou-rose.png"
                alt=""
                aria-hidden="true"
                className="bg-mark left-[-3.5rem] top-[16%] w-64"
                style={{ "--rot": "14deg" }}
            />
            <svg
                aria-hidden="true"
                className="bg-mark right-[-2.5rem] top-[52%] w-48"
                style={{ "--rot": "-8deg", animationDelay: "-8s" }}
                viewBox="0 0 100 100"
            >
                <circle cx="38" cy="68" r="20" fill="#4A2233" />
                <circle cx="64" cy="72" r="17" fill="#4A2233" />
                <path d="M40 56 C46 32 58 20 74 12" stroke="#4A2233" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M62 58 C64 38 68 24 74 12" stroke="#4A2233" strokeWidth="4" fill="none" strokeLinecap="round" />
                <ellipse cx="78" cy="13" rx="11" ry="6" fill="#4A2233" transform="rotate(-24 78 13)" />
            </svg>
            <img
                src="/bisou-rose.png"
                alt=""
                aria-hidden="true"
                className="bg-mark bottom-[7%] right-[6%] w-44"
                style={{ "--rot": "-12deg", animationDelay: "-14s" }}
            />

            <main
                inert={showIntro}
                aria-hidden={showIntro}
                className="relative z-[1] flex min-h-screen w-full flex-col"
            >
                {/* Hero — full bleed on mobile, contained on larger screens */}
                <header
                    data-testid="hero-portrait"
                    data-reveal
                    className="lg:mx-auto lg:flex lg:w-full lg:max-w-[1100px] lg:items-end lg:justify-center lg:gap-20 lg:px-10 lg:pt-20"
                >
                    <div
                        ref={heroImgColRef}
                        className="md:mx-auto md:max-w-md md:pt-12 lg:mx-0 lg:max-w-none lg:shrink-0 lg:pt-0"
                    >
                        <div className="relative lg:w-fit">
                            <img
                                src="/hero.jpg"
                                alt="Portrait de Lauofgirly"
                                className="h-[78svh] min-h-[480px] w-full object-cover object-[center_20%] md:h-auto md:min-h-0 md:object-contain lg:h-[74svh] lg:w-auto"
                                loading="eager"
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent to-[#FFF4F7] lg:h-1/4" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-[#FFF4F7] to-transparent lg:block" />
                            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/6 bg-gradient-to-r from-[#FFF4F7]/80 to-transparent lg:block" />
                            <h1 className="hero-name font-script absolute inset-x-0 bottom-0 translate-y-[38%] text-center text-7xl text-[#4A2233] md:translate-y-[30%] lg:hidden">
                                Lauofgirly
                            </h1>
                        </div>
                    </div>
                    <div
                        data-reveal
                        style={{ transitionDelay: "150ms" }}
                        className="hidden lg:flex lg:flex-col lg:items-start lg:justify-center lg:gap-8"
                    >
                        <h1 className="font-script text-left text-8xl leading-tight text-[#4A2233] xl:text-[7rem]">
                            Lauofgirly
                        </h1>
                        <p
                            data-testid="tagline-desktop"
                            className="max-w-md text-left text-lg font-medium leading-[1.9] text-[#4A2233]/75"
                        >
                            <span className="block whitespace-nowrap">
                                T’as eu une grosse journée au travail?
                            </span>
                            <span className="block whitespace-nowrap">
                                J’ai la solution pour que tu passes une belle soirée..
                            </span>
                        </p>
                        <div className="w-full max-w-xs">
                            <CtaButton testId="cta-button-primary-desktop" />
                        </div>
                    </div>
                </header>

                {/* Tagline + first CTA (mobile / tablet) */}
                <div
                    data-reveal
                    className="mx-auto flex w-full max-w-md flex-col items-center px-6 md:mt-12 lg:hidden"
                >
                    <p
                        data-testid="tagline"
                        className="mt-16 w-screen text-center text-[13px] font-medium leading-[1.9] text-[#4A2233]/80"
                    >
                        <span className="block whitespace-nowrap">
                            T’as eu une grosse journée au travail?
                        </span>
                        <span className="block whitespace-nowrap">
                            J’ai la solution pour que tu passes une belle soirée..
                        </span>
                    </p>
                    <div className="mt-10 w-full max-w-xs">
                        <CtaButton testId="cta-button-primary" />
                    </div>
                </div>

                {/* Cherries ornament — centred between the first button and the gallery */}
                <div
                    data-reveal
                    className={`${CHERRY_GAP} flex w-full justify-center`}
                >
                    <CherriesCharm className="h-[320px] w-[320px] md:h-[360px] md:w-[360px] lg:h-[420px] lg:w-[420px]" />
                </div>

                {/* Gallery — horizontal strip */}
                <section
                    data-reveal
                    className={`relative ${CHERRY_GAP} w-full overflow-hidden`}
                    aria-label="Galerie de photos"
                >
                    <img
                        src="/bisou-rose.png"
                        alt=""
                        aria-hidden="true"
                        className="kiss-watermark"
                    />
                    <GalleryStrip onOpen={setLightboxPhoto} />
                </section>

                {/* Outro — a text block, not a second pill */}
                <section
                    data-testid="outro"
                    className="mx-auto mt-20 flex w-full max-w-md flex-col items-center px-6 text-center"
                    aria-label="En savoir plus"
                >
                    <h2
                        data-reveal
                        className="font-script text-5xl leading-snug text-[#4A2233]"
                    >
                        Un aperçu de mon monde
                    </h2>
                    <p
                        data-reveal
                        style={{ transitionDelay: "130ms" }}
                        className="mt-5 text-[15px] font-medium leading-[2] text-[#4A2233]/75"
                    >
                        <span className="block">Ici, c’est juste un avant-goût.</span>
                        <span className="block">
                            Le reste, c’est ailleurs… et c’est pas mal moins sage.
                        </span>
                    </p>
                    <a
                        data-reveal
                        style={{ transitionDelay: "260ms" }}
                        data-testid="second-site-link"
                        className="second-link mt-7"
                        href={SECOND_SITE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            if (SECOND_SITE_URL === "SECOND_SITE_URL_PLACEHOLDER") {
                                e.preventDefault();
                            }
                        }}
                    >
                        Viens voir
                    </a>
                </section>

                {/* Footer */}
                <footer
                    data-testid="footer"
                    data-reveal
                    className="mx-auto mt-20 flex w-full max-w-md flex-col items-center px-6 pb-12"
                >
                    <div className="hairline" data-reveal="scale" />
                    <span className="font-script mt-10 text-3xl text-[#4A2233]/80">
                        Lauofgirly
                    </span>
                    <p className="mt-3 text-xs text-[#4A2233]/55">
                        © 2026 Lauofgirly · Tout doux, tout rose
                    </p>
                    <p
                        data-testid="cherries-attribution"
                        className="mt-2 text-[10px] leading-relaxed text-[#4A2233]/45"
                    >
                        Cherries by{" "}
                        <a
                            href="https://sketchfab.com/siotech2011"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-[#E8B96A]/60 underline-offset-2 hover:text-[#4A2233]/70"
                        >
                            siotech2011
                        </a>
                        , licensed under{" "}
                        <a
                            href="https://creativecommons.org/licenses/by/4.0/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-[#E8B96A]/60 underline-offset-2 hover:text-[#4A2233]/70"
                        >
                            CC BY 4.0
                        </a>
                    </p>
                </footer>
            </main>

            {lightboxPhoto && (
                <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
            )}
        </div>
    );
}
