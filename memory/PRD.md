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

## Verification done (v6)
375px: 3 cards, 4th gone, peek intact. 1440px: 3 cards, peek (maxScroll 296), arrows work (advance to end, prev appears). /g2.jpg returns SPA fallback HTML, not the image; file absent on disk.

## Backlog
- P0: Swap `PRIMARY_URL` in `src/App.js` with the real destination URL
- P1: Custom OG image (absolute URL) once domain is final
- P2: Optional analytics events on CTA taps

## Credentials
None — no auth in this app.
