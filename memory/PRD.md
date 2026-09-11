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

## Implemented (July 2026, v16 — compact cherries block)
- Deleted the "UN APERÇU DE MON MONDE" label and its gold hairline from the gallery section (footer hairline CSS retained — footer still uses it)
- Single shared spacing constant CHERRY_GAP (mt-5 lg:mt-6) governs both gaps around the cherries — they can't drift apart; strip's own mt-12 removed
- Desktop hero: dropped min-h-100svh and bottom padding, text column now bottom-aligns with the image so the charm sits exactly one gap under the desktop button too (right column is no longer vertically centred — required for equal gaps)

## Implemented (July 2026, v17 — outro text block + decorative polish)
- Second pink pill removed. Outro section after the strip: script heading "Un aperçu de mon monde", two-line copy, and SECOND_SITE_URL text link (plum, gold underline draws in on hover, placeholder-inert, constant next to PRIMARY_URL at top of App.js). Top pink button unchanged
- Atmosphere layer: film-grain SVG overlay (5% multiply, static), 26s drifting radial-gradient wash, sparse pale kiss/cherry watermark marks drifting slowly (clipped at page edges, behind content)
- Scroll reveals via one IntersectionObserver over [data-reveal] (fade+rise 16px, staggered transition-delays, once-only); footer hairline draws in via scaleX variant
- Hero portrait parallax: transform-only lag max 22px, rAF-throttled scroll listener, reduced-motion gated
- Refined hover/tap: soft springy easing on cards, button brightness, lightbox close, arrows
- All animation transform/opacity only; reduced-motion gets full styling with zero movement

## Implemented (July 2026, v18 — atmosphere visibility overhaul)
- Diagnosis: all effects were in the DOM and running — but (a) the film grain never rendered at all (SVG feTurbulence data-URI produced no paint) and (b) every other value was tuned near-invisible; (c) the reporter's Windows reduced-motion setting additionally gates all motion effects
- REAL BUG FIXED: grain replaced with a bundled PNG noise texture (src/grain.png, 128px tile — absolute /public URLs break css-loader compilation, lesson recorded)
- Intensities raised per "overshoot" instruction: grain opacity 0.22 (measured 5.8× texture over baseline), gradient washes alpha ~0.8 with ±4% drift on 22s cycle, reveals rise 36px over 1.1s, watermarks opacity 0.15 (identifiable kiss + cherry), hairline draw 1.4s, shimmer alpha 0.55, parallax factor 0.12 cap 48px

## Implemented (July 2026, v19 — grain removed entirely)
- Film grain fully deleted: overlay element, .grain-overlay CSS rule, stale comment, and the src/grain.png texture file. Zero "grain" references remain in src/
- Stacking audit: grain was one of several independently z-indexed background layers (all z-0); its removal changes nothing else — content still layers above via main z-[1]; gradient/vignette/bokeh/marks/glows confirmed intact
- Recorded lesson: absolute /public URLs break css-loader — bundle assets via src/

## Implemented (July 2026, v20 — hero seam + clipped watermark fixes)
- Hero fade replaced with multi-stop eased gradients (6 stops bottom, 5 stops sides), fade distance extended (h-2/5 → 62% mobile / 45% desktop, side fades kept); end colour exactly rgba(255,244,247,1) = page bg
- Kiss bg-mark moved fully inside the viewport (left-[-3.5rem] → left-16 — rotation expands bounds ~35px, accounted for); bottom-right kiss right 6%→10% for rotation headroom; neither sits behind name/tagline

## Implemented (July 2026, v21 — overlap root cause + fix)
- Diagnosis (instrumented scroll sampling): the reveal was NOT the cause. The parallax was — the script name is absolutely positioned INSIDE the parallaxed portrait column, so on scroll the name moved at 0.88× page speed while the tagline moved at 1.0×; they closed 12px per 100px of scroll and collided past scrollY≈300. (Contributing: absolute h1 reserves no layout space for its overhang.)
- Fix: parallax now runs only at lg+ where the text lives in its own column (matchMedia min-width 1024 + reduced-motion gate; transform cleared below lg). Mobile tagline block is fade-only (data-reveal="fade"). Nested reveal on the desktop text column removed (was compounding with the header reveal).

## Implemented (July 2026, v22 — hero goes fully static)
- Deleted (not disabled): the parallax useEffect + heroImgColRef, data-reveal on the hero header, data-reveal="fade" on the mobile tagline block. No scroll-driven or entrance transform remains on any hero element; name/tagline/button are fixed document-flow positions
- Kept per spec: intro animation (pre-page), and everything below the hero (cherries spin/drag, gallery autoscroll, gradient drift, shimmer, bokeh, watermarks, reveals on lower sections, footer hairline draw)
- Note: CTA breathing pulse/shimmer (idle, not scroll-driven) intentionally kept in hero; hero-glow has a static centering transform (never animated)

## Implemented (July 2026, v23 — intro name change)
- Intro handwriting name changed to "lauegauths": SVG paths regenerated from the Great Vibes TTF with the same fontTools pipeline (real glyph outlines, stroke-dashoffset animation unchanged, same timing/kiss/skip). aria-label updated. Hero name remains "Lauofgirly"
- /tmp generator + font were wiped by a pod restart; recreated on the fly (output persists at src/namePaths.json)

## Implemented (July 2026, v24 — full rename)
- "Lauofgirly" → "lauegauths" (all lowercase) everywhere: hero name (mobile + desktop), footer script + copyright, page title, meta description, OG/Twitter tags, noscript, gallery image alts. Intro SVG paths already regenerated for lauegauths in v23 (real glyph outlines). grep confirms zero old-name occurrences in src/ and public/index.html

## Implemented (July 2026, v25 — background music)
- ambiance.mp3 in public/, MusicToggle component (src/components/MusicToggle.js): fixed bottom-right 44px powder-pink frosted button (z-50, below intro), VolumeX/Volume2 lucide icons read from the audio element's real paused+muted state
- Behaviour: preload="none" (zero fetch until first unmute — verified via performance entries), fade-in to 0.25 over 600ms, fade-out then pause+mute, plain `loop` attribute (no seam fades), choice persisted in localStorage ("lauegauths_music"), returning visitors with "on" resume on first interaction after the intro (gated on intro completion), silent by default everywhere
- Bug found+fixed in verification: rAF timestamps can predate performance.now(), making fade progress negative → IndexSizeError; progress and volume now clamped

## Implemented (July 2026, v26 — autostart music)
- Music now starts on its own: muted autoplay arms the element once the intro finishes; listeners on pointerdown/click/keydown/touchstart/touchend/wheel/scroll all attempt unmute+play, and stay attached if play() rejects (scroll/wheel grant no audio permission) — they detach only after the element's "playing" event confirms real playback; fade-in 600ms to 0.25 on confirmed start
- preload "none" → "auto" so the file is ready at first interaction
- Explicit mute via the toggle saves "off" in localStorage and is never overridden by autostart; manual unmute always works and saves "on"
- Toggle button, loop-without-seam-fade, and audio-element-as-source-of-truth unchanged

## Implemented (July 2026, v27 — music volume 0.25 → 0.15)
- TARGET_VOLUME constant lowered to 0.15; all three fade-in paths (autostart confirm, armed-element unmute, manual toggle) reference the constant; fade-out always ends at 0 and pauses+mutes. grep confirms no 0.25 remains

## Implemented (July 2026, v28 — hero kiss watermark deleted)
- Removed the top-left kiss bg-mark (the one clipped by the hero fade behind the name). Kept: the bottom-right kiss mark and the gallery kiss watermark. Nothing sits behind the script name now except the intentional soft radial glow

## Implemented (July 2026, v29 — new ambiance track)
- ambiance.mp3 replaced in place (new file, 15.28s, 250KB). Audio code untouched: plain `loop` attribute, no fades/ramps anywhere near the seam (volume ramps exist only at user start/stop). All behaviours unchanged: autostart on first interaction, toggle, 0.15 volume, localStorage, preload auto

## Implemented (July 2026, v30 — intro sped up to ~4s)
- Kiss press 0.9s → 0.7s; writing starts at 1.2s (0.4s kiss hold) and draws over 1.9s (same gentle easing, same SVG paths); 0.3s hold; fade starts 3.4s, overlay removed 3.9s. Skip/replay/reduced-motion unchanged

## Implemented (July 2026, v30b — background music fully removed)
- Deleted: MusicToggle.js component, public/ambiance.mp3, the App.js import and usage, all interaction listeners, volume fade code, toggle button. A one-line localStorage.removeItem("lauegauths_music") in App's mount effect cleans the stored preference from returning visitors' browsers — the only remaining trace, intentional
- Dependency check: nothing piggybacked on the music listeners (cherries drag, gallery drag/autoscroll, lightbox all have self-contained handlers — retested)

## Implemented (July 2026, v31 — hero primary button + outro button + copy trim)
- Outro line shortened to "Le reste, c'est ailleurs." (same styling/position)
- Outro text link replaced with a soft-pink pill button (.cta-soft: #F7CAD9 fill, plum text, gold hairline border, subtle shadow, 52px, press state; testid now cta-button-secondary); .second-link CSS deleted
- New primary "Viens me rejoindre" button straddling the hero photo's bottom edge (all breakpoints via the shared image wrapper): hot pink, larger/heavier, pulsing glow halo (3.4s) + inherited shine sweep; positioned via a translate wrapper so the glow animation never fights positioning; mobile hero name moved up (bottom-16, overhang removed) to make room; links to PRIMARY_URL
- Reduced-motion: glow + shine disabled, button fully visible

## Implemented (July 2026, v32 — middle button removed, layout tightened)
- Removed the middle "VIENS VOIR" pill from below the tagline — both the mobile/tablet instance AND the desktop hero right-column instance (caught on desktop verification); the CtaButton component became orphaned and was deleted too
- Shared CHERRY_GAP widened (mt-5/6 → mt-8/10) so tagline→cherries→photos reads even after the removal; closing-section rhythm confirmed (text→button 32px, button→hairline 80px, hairline→signature 40px)
- Bottom soft-pink "Viens voir" stays under "Le reste, c'est ailleurs.", above signature/footer

## Implemented (July 2026, v33 — hero name overlay removed, button moved up)
- Deleted the script "lauegauths" h1 overlaid on the hero photo (mobile/tablet only) + its now-unused .hero-name CSS. Name survives everywhere else: desktop text column, footer signature, page title, meta/OG tags
- "Viens me rejoindre" moved from straddling the bottom edge to centred in the lower-middle of the photo (bottom 18%), same size/fill/glow/shine; soft plum blurred scrim behind it for readability over the photo; tagline follows the photo at normal spacing (no dead space)

## Implemented (July 2026, v34 — live URL connected)
- PRIMARY_URL and SECOND_SITE_URL both set to https://www.lauegauths.com — the hero "Viens me rejoindre" and closing "Viens voir" buttons now navigate for real (new tab, rel noopener noreferrer)
- Placeholder guard onClick handlers deleted — grep for "PLACEHOLDER" across src/ and public/ returns nothing
- Note: the "old destination" was never a real URL — both buttons pointed at placeholder constants, now fully gone

## Verification done (v34)
375px: both rendered anchors read href https://www.lauegauths.com/, target _blank, rel noopener noreferrer; hero button styling/glow unchanged in screenshot.

## Backlog
- P0: Swap `PRIMARY_URL` in `src/App.js` with the real destination URL
- P1: Custom OG image (absolute URL) once domain is final
- P2: Optional analytics events on CTA taps

## Credentials
None — no auth in this app.
