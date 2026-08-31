# PRD — Lauofgirly Link-in-Bio

## Original problem statement
Single-page, mobile-first "link in bio" site for creator Lauofgirly (linked from Instagram/TikTok bios). Exactly one destination: a single button ("Viens voir"), repeated twice. No social links. All copy in French, `html lang="fr"`. Palette: cream-rose #FFF4F7 bg, powder pink #F7CAD9 surfaces, hot pink #FF4D8D (CTA only), gold #E8B96A accents, deep plum #4A2233 text (no pure black). Elegant script (Great Vibes) for her name, Plus Jakarta Sans otherwise. Intro animation: kiss mark presses in with bounce + tilt, name writes itself in script, fades out — under 3s, tap-to-skip, sessionStorage-gated, respects prefers-reduced-motion. Hero portrait with name overlay, French tagline, breathing/shimmer CTA, irregular 7-photo gallery with lightbox, kiss motif (gallery corner + button hover/tap), minimal footer, French SEO/OG meta. Assets used as-is from the provided zip, flat in `frontend/public/`. Link is a placeholder constant `PRIMARY_URL = "PRIMARY_URL_PLACEHOLDER"` in `src/App.js` — buttons render normally but don't navigate until swapped.

## Architecture
Static single-page React app (`src/App.js` + `src/App.css`); no backend or database usage. Assets served from `frontend/public/`.

## User personas
Mobile visitors arriving from Lauofgirly's Instagram/TikTok bios.

## Implemented (July 2026)
- Intro kiss-mark animation overlay (skippable, session-only, reduced-motion aware)
- Hero portrait with script name overlay, French tagline
- Two hot-pink "Viens voir" CTAs with breathing pulse + shimmer, kiss on hover/tap
- Irregular 7-photo gallery with lightbox (Escape/backdrop close)
- Kiss motif on gallery corner; minimal French footer
- French title, meta description, OG/Twitter tags, `lang="fr"`
- All assets extracted flat into `frontend/public/`

## Verification done
375px viewport: intro plays then page appears; lightbox opens/closes; both CTAs render; lang/title/description confirmed French. Desktop 1920px: centered column holds up. Button navigation intentionally inert while placeholder is set.

## Backlog
- P0: Swap `PRIMARY_URL` in `src/App.js` with the real destination URL
- P1: Custom OG image (absolute URL) once domain is final
- P2: Optional analytics events on CTA taps

## Credentials
None — no auth in this app.
