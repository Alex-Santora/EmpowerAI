# FutureWithAI Mission — continuous campus journey

## Scope and preserved infrastructure

This revision changes only files in `src/mission/`. The existing `/` route, official logo, educational copy, statistics, four commitments, founder quote, social links, CTAs and footer destinations are preserved. The requested opening headline now leads the page; "Universal Access to AI Education" follows in the ecosystem introduction. Existing uncommitted changes in `src/App.jsx`, package files and `.gitignore` predate this revision and were left intact. Nothing was merged or deployed.

The existing direct Three.js implementation (not React Three Fiber), lazy scene import, instancing helpers, shared geometry/materials, cubic Hermite camera interpolator, passive native scroll handling, and reading fallback were retained. The SVG loading/failure backdrop is unchanged.

## Audit and visual changes

The original pale stone/porcelain, bright sky reflection map, grey-blue fog, strong hemisphere/sun lighting and exposure 1.35 combined to flatten the city. The old camera spent much of its route outside the structures and held a nearly identical low plaza view for a long interval. Projected labels, floating stats and eight bottom navigation stops reinforced the slideshow/HUD impression.

The revised campus uses deep navy (#071321), blue glass (#29475f), structural blue-grey (#304b61), restrained cyan (#66c2d1), planted green (#24574b) and localized warm light. Manrope remains the site's display and reading typeface. Narrow illuminated window strips, recessed floor reveals, solid service cores, fins and roof equipment give the facades depth. The library has taller ribbed academic wings; the workshop has open frames, roof ribs, benches and unfinished modules; mentorship has an open circular colonnade, planted roof, terraced seating and clustered trees. Paths and elevated walkways physically connect them to the central public plaza. Foreground perimeter buildings belong to the same campus and return in the final aerial.

The projected stats/links, decorative world caption, numbered promises, bottom chapter dots, arrows and progress ruler were removed. Statistics remain in the readable ecosystem content. Navigation remains in the site header and normal CTAs; a simple scroll cue and reading control remain below. There are no content cards or glass panels. Library and human-purpose text sit on the right; the other locations use the left, with directional contrast gradients.

## Files

- `MissionPage.jsx`: preserved semantic content, opening headline order, scroll-linked opacity/15px text transitions, simplified controls, accessibility and reading behavior.
- `timeline.js`: independent position/target control points and narrative ranges.
- `camera.js`: retained nonuniform cubic Hermite interpolation; allocation-free sampling, small pointer translation, mobile framing and static reduced-motion rig.
- `MissionScene.jsx`: darker lighting/reflections/fog, cached shadows, lifecycle cleanup, adaptive GPU resolution and static rendering support.
- `city.js`: retained procedural instancing infrastructure; revised architecture, materials, landscaping and calm path signals; removed vehicles, toy figures, printed monument labels and pale mountain backdrops.
- `mission.css`: isolated Mission typography, location compositions, contrast gradients, responsive layouts and reading fallback.
- `README.md`: this implementation and verification record.

## Scroll and camera

The 1300svh rail supplies 12 viewport heights of scroll travel. Native scroll position maps to 0–1. A ref follows that position with frame-rate-independent exponential damping (rate 6); no wheel interception, scroll snapping or added animation library is used. React updates only when the active chapter changes. Text entry/exit opacity and 15px translation are driven directly by this same progress, over a .018 interval at chapter edges.

| Progress | Content and physical movement |
| --- | --- |
| 0–.13 | Opening: outside/above campus; foreground perimeter tower and elevated bridge frame the descent |
| .13–.24 | Ecosystem: approach the academic wings and central landmark |
| .24–.37 | Learning: descend to approximately 11–14 units above ground alongside library fins |
| .37–.49 | Projects: curve through the gap toward open workshop frames |
| .49–.61 | Mentorship: enter the garden at approximately 6–8 units, passing trees and pavilion columns |
| .61–.74 | Student purpose: cross toward the public plaza at approximately 5.5 units |
| .74–.88 | Commitments: arc around the plaza and begin rising |
| .88–1 | Quote: continue rising/backing away to 93 units; reveal the connected campus and settle ambient motion |

Fourteen camera control points interpolate position and look-at target independently with time-aware cubic tangents. The points do not coincide with section boundaries. The route travels from [68,43,116], into [-8,11,23], past [45,8,54], through [7,5.5,73], and finishes at [-76,93,164]. Near structures therefore cross the screen faster than distant buildings; nothing is swapped out between chapters. Mobile pulls the camera back along the viewing direction and uses a wider 58-degree field of view. Desktop mouse influence is small (up to .45 units translation and .006 radians yaw) and settles to zero during the ending.

## Performance and fallback

- No new dependencies, external models, large textures or post-processing passes.
- Repeated forms are instanced by shared geometry/material. Only a few path signals move independently.
- Desktop DPR cap 1.5; mobile 1.2. Mobile creates fewer trees/signals/distant buildings and omits shadows.
- One static 2048 shadow map, refreshed for resizing, instead of rendering shadows every frame.
- A 256x128 procedural reflection source is prefiltered once and disposed with the scene.
- After warm-up, sustained frames slower than 30ms lower DPR to 1 and remove shadows; the city stays visible.
- All frame loops pause while the tab is hidden. Geometry, materials, textures, observers, listeners, renderer and WebGL context are released on unmount.
- Reduced motion uses a single static aerial render, no pointer listeners or animation loop, and all eight chapters in normal reading flow.
- Short landscape under 560px high, or phones under 680px high, also use readable document flow with a static city.
- Manual reading mode, save-data/low-memory preference, WebGL failure, context loss and lazy import failure retain the complete readable content. Manual reading mode releases WebGL.
- The lazy Three.js scene remains approximately 519KB minified / 133KB gzip, so Vite's standard raw-chunk size advisory remains.

## Verification — September 5, 2026

- Production build and whitespace checks pass.
- Existing camera test sampled 2,001 positions each for desktop/mobile: finite position/orientation, elevation above ground, no abrupt steps. Largest sample displacement .390 desktop / .490 mobile world units; largest rotation step .00892 radians. This verifies continuity, not exhaustive geometry collision or perceptual motion comfort.
- Educational chapter titles, copy, destinations and commitments compared directly with the saved pre-revision modules: preserved.
- Browser layout checks covered all eight chapters at 360x800, 390x844, 768x1024, 1024x768 and 1440x900: no horizontal overflow or header/control overlap. The continuous journey also received visual review at 1280x720.
- Keyboard activation of reading mode exposed eight sections, one H1 and all four primary CTAs, with no canvas. Returning recreated the canvas. Escape closes the mobile menu and returns focus to Menu.
- Local QA harness simulated reduced motion (static canvas, all chapters), unavailable WebGL (no canvas, all chapters), and tested a 360x640 viewport (static city, all chapters). These are browser simulations, not physical-device tests.
- Course filter still changes from four AI Literacy resources to nine Math Foundations resources. Projects, Mentorship, Acknowledgments and missing-route headings load; no Mission canvas remains on those routes.
- The in-app browser reported approximately 30fps. The 60fps target is **not verified**. Physical-device GPU performance, real API generation and deployment were not tested.

Run the existing workflow with `npm.cmd run dev`; `node node_modules/vite/bin/vite.js` is the direct launcher used for this verification. The preview for this revision used port 5174 because 5173 was occupied. Procedural geometry/lighting edits require a full page reload when React Fast Refresh retains the effect.

