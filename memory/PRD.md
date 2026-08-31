# PRD — Lauofgirly Link-in-Bio

## Original problem statement
Single-page, mobile-first "link in bio" site for creator Lauofgirly (linked from Instagram/TikTok bios). Exactly one destination: a single button ("Viens voir"), repeated twice. No social links. All copy in French, `html lang="fr"`. Palette: cream-rose #FFF4F7 bg, powder pink #F7CAD9 surfaces, hot pink #FF4D8D (CTA only), gold #E8B96A accents, deep plum #4A2233 text (no pure black). Elegant script (Great Vibes) for her name, Plus Jakarta Sans otherwise. Intro animation: kiss mark presses in with bounce + tilt, name writes itself in script, fades out — under 3s, tap-to-skip, sessionStorage-gated, respects prefers-reduced-motion. Hero portrait with name overlay, French tagline, breathing/shimmer CTA, irregular 7-photo gallery with lightbox, kiss motif (gallery corner + button hover/tap), minimal footer, French SEO/OG meta. Assets used as-is from the provided zip, flat in `frontend/public/`. Link is a placeholder constant `PRIMARY_URL = "PRIMARY_URL_PLACEHOLDER"` in `src/App.js` — buttons render normally but don't navigate until swapped.

## Architecture
Static single-page React app (`src/App.js` + `src/App.css`); no backend or database usage. Assets served from `frontend/public/`.

## User personas
Mobile visitors arriving from Lauofgirly's Instagram/TikTok bios.

## Implemented (July 2026, v2 — brand landing revision)
- Intro rebuilt as REAL handwriting: name converted to SVG vector paths from the Great Vibes TTF (fontTools script → `src/namePaths.json`), animated via stroke-dashoffset per glyph, left to right, then ink fill; kiss presses in first; under 3s, tap-to-skip, sessionStorage-gated, reduced-motion skips
- Hero full-bleed edge-to-edge, gradient fade into cream at bottom, script name breaking past the image boundary; desktop crop tuned (`lg:h-[94svh] lg:object-[center_12%]`) so her face is never cut
- Gallery cut to 4 photos (g1, g6, g7, g2) as a horizontal swipe strip with peeking next card, uniform 3:4 crop (`object-[center_18%]`), lightbox kept
- Breathing room: large vertical gaps (mt-28/32), thin gold hairline separators, small letter-spaced caps section labels
- Kiss motif restrained: pale oversized watermark behind gallery + one small print in empty corner; removed from button hover and section label
- Button unchanged: "Viens voir", hot pink #FF4D8D, breathing pulse + shimmer, two placements
- French title, meta description, OG/Twitter tags, `lang="fr"`; all assets used as-is

## Verification done (v2)
375px: intro strokes captured mid-write (partial "L", "Lauof"), sequence completes, page appears; strip swipes with peek; both CTAs render. Desktop 1920px: hero face intact, strip and watermark hold up. Button navigation intentionally inert while placeholder is set.

## Implemented (July 2026, v3 — desktop layout + intro pacing fixes)
- Hero responsive restructure: full-bleed kept below 768px; 768–1023px becomes a centred single column with portrait capped at max-w-md; ≥1024px becomes two-column (45% contained portrait at natural 4:5, right column with script name + tagline + CTA vertically centred), cream fills the rest, soft gradients where image meets background
- Desktop gallery: strip capped (max-w-xl/max-w-3xl) so the next card keeps peeking; watermark repositioned fully inside the visible area; stray corner kiss removed — only the pale watermark remains
- Intro pacing: kiss 0.6s + hold, handwriting over ~1.8s with ease-in-out per glyph, 0.4s hold on the finished name, 0.5s fade — ~3.5s total; still skippable, once per session, reduced-motion skips

## Verification done (v3)
Hero checked at 375px (full-bleed, face intact), 768px (centred contained column), 1024px and 1440px (two-column, face and torso never cropped). Strip peek confirmed at every width; watermark fully on-screen; stray kiss gone. Intro measured at ~3.5s total with slower mid-write capture ("Lauofgi"). Note: verified via screenshot tooling — no testing_agent subagent exists in this environment's toolset.

## Implemented (July 2026, v4 — desktop polish round 2)
- Intro investigation: no viewport gating exists; verified playing identically at 1440px fresh session (root cause of the report: sessionStorage persists across reloads in the same desktop tab, so it never replays on that tab — the requested once-per-session behavior; OS-level reduced-motion also skips it by design)
- Desktop gallery: click-and-drag (window-listener based, snap disabled during drag, drag doesn't trigger lightbox), trackpad/wheel horizontal scrolling (hands back to page scroll at strip ends), and arrow controls on both edges (hidden below 768px, auto-hide at strip start/end); mobile touch swipe untouched
- Desktop hero rework: whole block centred as one unit capped at 1100px with normal gap; portrait larger (74svh, natural proportion); name/tagline/button left-aligned as a group, vertically centred against the image; cream gradient fades on right/left/bottom image edges; generous vertical breathing room
- Bug found + fixed during verification: pointer capture was swallowing card clicks (lightbox wouldn't open) — replaced with window-listener drag

## Implemented (July 2026, v5 — intro replay + desktop investigation)
- Investigation (1440px fresh session, instrumented): intro mounts, is fully visible (fixed/z-60/opacity 1/full viewport), no viewport/touch/width gating anywhere, skip does not auto-fire, SVG dashoffset animates at desktop dimensions. Only remaining gate: prefers-reduced-motion — the likely cause on the reporter's desktop OS (Windows animation effects / macOS Reduce Motion / Linux DEs report `reduce`; incognito does not reset OS settings)
- Intro now plays on EVERY page load: sessionStorage flag fully removed; refresh, new tab, return visit and back-navigation all replay the full sequence
- Skip now works via click, tap AND any keypress; skipping affects only that visit
- Page behind the intro is inert + aria-hidden until the intro finishes
- Kiss press animation tightened to 0.6s per spec

## Implemented (July 2026, v6 — gallery curation)
- Removed 4th gallery card (g2.jpg, pink plaid fitting room) — too suggestive for IG/TikTok bio linking; file deleted from frontend/public (confirmed no longer served as an image)
- Strip now 3 cards (g1, g6, g7), same card size/spacing/peek — no layout change needed, 3-card rhythm verified
- SFW audit of remaining images: hero (face-forward selfie, black top), g1 (pink sweatshirt face close-up), g6 (white hoodie, hand over mouth, face-framed), g7 (black tee, tongue out, face close-up) — all face-centred and fully clothed, none flagged

## Implemented (July 2026, v7 — slower intro pacing)
- Intro stretched to ~5.5s: kiss press 0.9s, 0.7s kiss-only hold, handwriting 2.6s (gentler ease-in-out per glyph), 0.7s hold on finished name, 0.6s fade
- Added subtle kiss "breathing" (scale 1↔1.035 over 3.4s loop) during the holds so the screen never feels dead — disclosed to user
- Skip (click/tap/keypress), replay-on-every-load, reduced-motion skip all unchanged

## Implemented (July 2026, v8 — new tagline)
- Tagline replaced with two forced lines: "T'as eu une grosse journée au travail?" / "J'ai la solution pour que tu passes une belle soirée.." (typographic apostrophes, user's double period kept)
- Mobile: block spans with whitespace-nowrap, full-viewport-width container, 13px (reduced from 16px per user's "reduce rather than wrap" rule), leading 1.9; verified single-line at 375px AND 360px
- Desktop: same two lines, text-lg, max-w-md, left-aligned group unchanged

## Implemented (July 2026, v9 — 3D cherries charm)
- cherries.glb (2.6MB, as-is) in frontend/public, rendered via dynamically-imported three.js (`src/components/CherriesCharm.js`): transparent canvas, no frame, warm hemisphere + directional lighting, auto-normalized scale/centering
- Slow 360° Y rotation (~9s/turn), IntersectionObserver pauses the loop offscreen, prefers-reduced-motion renders a static frame, WebGL/model failure fails silently to empty space
- Lazy: dynamic import after mount, fixed-size host div reserves space (zero layout shift, no spinner), page fully usable before load
- Placement: absolute-anchored to an inline-block span wrapping the script name — beside the "y", offset upward over the photo fade on mobile (92px / 112px md), equivalent spot in the desktop text column (124px / 140px xl)
- Footer attribution line (licence-required): "Cherries by siotech2011, licensed under CC BY 4.0" with both links, muted 10px style
- "Viens voir" button placement untouched

## Implemented (July 2026, v10 — cherries cropping fix + reposition)
- Cropping root cause: camera distance was fitted to the model's frontal bounding box (1.7 units vs ~1.66 frustum height) — fixed by fitting against the bounding SPHERE (covers every rotation angle) with 22% padding
- Charm moved out of the name area: now page-centred below the first "Viens voir" button (single shared placement after the mobile CTA block / after the hero on desktop), 120px mobile / 136px md / 150px lg, gallery top margin tightened (mt-32 → mt-16/20) to absorb the added height
- Name spans reverted to plain text; no charm near the name anywhere

## Implemented (July 2026, v11 — cherries size-up + real clipping root cause)
- TRUE root cause of clipping/off-centre (found via live instrumentation): canvas sized once at mount and never resized — when the viewport changed after load (or mount happened at a different breakpoint), the oversized canvas overflowed its box top-left, shifting the model bottom-right and cutting it at the edge. Fixed with a ResizeObserver keeping renderer size matched to the host div
- Camera fit now: pivot-wrapper centring (immune to the GLB's baked node transforms) + bounding-sphere fit with padding tuned from measured silhouette sweep (1.05 → worst margin 65px at every angle)
- Size tripled: canvas 320px mobile / 360px md / 420px lg; fruit renders ~175px wide on mobile (vs ~55px before); surrounding spacing tightened (mt-12) to absorb height

## Implemented (July 2026, v12 — cherries drag + gallery autoplay)
- Cherries spacing tightened (mt-12→mt-4 wrapper, gallery mt-12→mt-4/8) — deliberate ornament, same model size
- Cherries draggable: pointer events (mouse/touch/pen), horizontal drag spins on Y, throw momentum with exponential ease-down blending smoothly into the auto loop (no snap), touch-action pan-y so vertical swipes always scroll the page, reduced-motion users static but draggable
- Gallery autoplay: continuous ~30px/s drift via rAF, 3× duplicated photos with invisible ±setWidth teleport = seamless infinite loop both directions, pauses on hover/drag/wheel/arrow (1.5s grace), stops offscreen (IntersectionObserver) and for reduced-motion; scroll-snap removed (conflicts with drift)
- Gallery now 5 photos: added g5.jpg + g3.jpg (same card size/crop; g2/g4 permanently excluded, g2 deleted from disk); arrows always visible (infinite strip); 15 rendered cards with unique testids

## Implemented (July 2026, v13 — cherries relight + autoscroll re-verify)
- Cherries relit: ACES tone mapping (exposure 1.15), ambient 0.85 + hemisphere 1.5 + warm key 2.6 + pink fill 1.15 from opposite side; materials patched via onBeforeCompile — saturation ×1.4 and brightness ×1.12 on the sampled texture (texture file untouched), roughness capped 0.55, metalness 0. Result: vivid cherry red, fresh green leaf, glossy but not blown highlights
- Gallery autoscroll re-verified end-to-end per restated spec (implementation from v12 unchanged)

## Implemented (July 2026, v14 — autoscroll diagnosis + robustness fix)
- Diagnosis (instrumented, no changes first): loop fires and moves scrollLeft (~31px/s), no transform fighting, scrollSnapType is none (snap removed in v12), pause flags initialise unpaused, IntersectionObserver reports correctly. Remaining causes: (a) prefers-reduced-motion — the marquee intentionally freezes when the OS reports reduce, which is the case on the reporter's Windows machine (animation effects off); this is the specified behaviour, kept. (b) Structural fragility: `scrollLeft += 0.5px/frame` never accumulates on browsers with integer-rounded scrollLeft (older Safari)
- Fix: float position accumulator — JS tracks exact position and writes absolute scrollLeft each frame; manual interactions resync the accumulator. Seamless wrap unchanged
- Verified: 2.16 cycles at 375px and 2.17 cycles at 1440px, 2 wraps each, zero anomalous deltas, band-consistent

## Verification done (v14)
Two full loop cycles watched at both 375px and 1440px with per-1.5s sampling — continuous drift, invisible wraps, no jumps. If the strip appears frozen on a given machine, its OS is reporting reduced motion (Windows: Settings > Accessibility > Visual effects > Animation effects).

## Implemented (July 2026, v15 — drift speed doubled)
- Gallery drift 30 → 60 px/s (measured ~65px/s effective, ~2.2× faster); nothing else touched

## Verification done (v15)
Full cycle + wrap crossing at 375px (1.23 cycles) and 1440px (1.18 cycles): steady per-second deltas, zero anomalies, seamless wrap at the higher speed.

## Backlog
- P0: Swap `PRIMARY_URL` in `src/App.js` with the real destination URL
- P1: Custom OG image (absolute URL) once domain is final
- P2: Optional analytics events on CTA taps

## Credentials
None — no auth in this app.
