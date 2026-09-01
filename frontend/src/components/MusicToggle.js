import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MUSIC_KEY = "lauegauths_music";
const TARGET_VOLUME = 0.25;

function fadeVolume(audio, target, ms, onDone) {
    const start = audio.volume;
    const t0 = performance.now();
    cancelAnimationFrame(audio._fadeRaf);
    const step = (now) => {
        const p = Math.max(0, Math.min(1, (now - t0) / ms));
        audio.volume = Math.min(1, Math.max(0, start + (target - start) * p));
        if (p < 1) {
            audio._fadeRaf = requestAnimationFrame(step);
        } else if (onDone) {
            onDone();
        }
    };
    audio._fadeRaf = requestAnimationFrame(step);
}

export default function MusicToggle({ enabled }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    // Icon state reads the audio element itself (paused + muted)
    useEffect(() => {
        const a = audioRef.current;
        const sync = () => setPlaying(!a.paused && !a.muted);
        a.addEventListener("play", sync);
        a.addEventListener("pause", sync);
        a.addEventListener("volumechange", sync);
        sync();
        return () => {
            a.removeEventListener("play", sync);
            a.removeEventListener("pause", sync);
            a.removeEventListener("volumechange", sync);
        };
    }, []);

    // Returning visitors who left music on: start on first interaction
    // (only once the intro has finished)
    useEffect(() => {
        if (!enabled) return;
        if (localStorage.getItem(MUSIC_KEY) !== "on") return;
        const a = audioRef.current;
        const tryStart = () => {
            if (!a.paused) return;
            a.muted = false;
            a.volume = 0;
            a.play()
                .then(() => fadeVolume(a, TARGET_VOLUME, 600))
                .catch(() => {});
        };
        window.addEventListener("pointerdown", tryStart, { once: true });
        window.addEventListener("keydown", tryStart, { once: true });
        return () => {
            window.removeEventListener("pointerdown", tryStart);
            window.removeEventListener("keydown", tryStart);
        };
    }, [enabled]);

    const toggle = async () => {
        const a = audioRef.current;
        if (a.paused) {
            a.muted = false;
            a.volume = 0;
            try {
                await a.play();
                fadeVolume(a, TARGET_VOLUME, 600);
                localStorage.setItem(MUSIC_KEY, "on");
            } catch {
                /* playback blocked — stay silent */
            }
        } else {
            fadeVolume(a, 0, 400, () => {
                a.pause();
                a.muted = true;
            });
            localStorage.setItem(MUSIC_KEY, "off");
        }
    };

    return (
        <>
            <audio ref={audioRef} src="/ambiance.mp3" preload="none" loop muted />
            <button
                data-testid="music-toggle-button"
                onClick={toggle}
                aria-label={playing ? "Couper la musique" : "Activer la musique"}
                aria-pressed={playing}
                className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#E8B96A]/60 bg-[#F7CAD9]/70 text-[#4A2233] shadow-[0_6px_18px_rgba(74,34,51,0.14)] backdrop-blur-md transition-colors duration-300 hover:bg-[#F7CAD9] active:scale-95"
            >
                {playing ? <Volume2 size={19} /> : <VolumeX size={19} />}
            </button>
        </>
    );
}
