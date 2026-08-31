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

## Backlog
- P0: Swap `PRIMARY_URL` in `src/App.js` with the real destination URL
- P1: Custom OG image (absolute URL) once domain is final
- P2: Optional analytics events on CTA taps

## Credentials
None — no auth in this app.
