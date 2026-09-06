# FutureWithAI Mission — continuous campus journey

## September 6, 2026 — architecture refinement

This pass refines the existing world in `city.js`. The supplied 23.47-second screen recording was reviewed from beginning to end through sequential local frames before editing. It showed repeated window dots, disconnected workshop elements, dominant tree crowns, and a repetitive skyline. The original camera, chapter timings, copy, typography, overlays, navigation, palette, renderer, and fallback strategy were retained. `MissionPage.jsx` has only a null guard for a resize callback arriving after route teardown; the scroll calculations are unchanged.

The environment now uses an authored campus plan:

| Journey | Architectural composition |
| --- | --- |
| Arrival / ecosystem | A stepped foreground institute frames the lower campus, with one dominant research tower beyond it. |
| Learning | A terraced learning hall, glazed atrium, reading roof and finned rear book stack retain close facade parallax. |
| Projects | Five supported sawtooth roof bays, clerestories, recessed glazing, work tables and suspended task lighting define a maker lab. |
| Mentorship | An open annular canopy rests on a colonnade around a small planted court. Trees frame the view below the text. |
| Human purpose | A rectangular reflecting pool, grounded ring sculpture, benches and paving joints establish a quieter civic plaza. |
| Commitments / ascent | The lower western hall leaves the plaza legible as the camera rises. The eastern institute has a glazed link between occupied floors. Low academic wings form the background. |

Facades use consistent 3.3-metre floors, continuous glass bays, structural mullions, selected occupied floor bands and roof setbacks. Six material families distinguish structure, panels, glazing, paving/water, light and planting using the existing colours. The existing environment map reveals the glazing as the viewing angle changes. The formerly elevated winding ribbon is now a thick, ground-level pedestrian promenade with a recessed curb light and entrance approaches. Planting occurs in authored groups, with smaller narrow crowns, low beds and restrained furniture. Static components still share geometries/materials and use instancing; mobile retains all six architectural identities and removes secondary background and planting detail.

Verification for this pass:

- Reviewed the desktop journey at 51 positions, with an additional 16-position desktop pass after structural corrections; reviewed all 16 mobile positions at 390×844.
- Camera continuity and architectural box-intersection checks sampled 2,001 positions each for desktop and mobile. No camera intersections were found. Ground-floor slab corners were also checked against the campus ground footprints. These checks supplement the visual review; they are not an engineering structural analysis.
- Desktop rendering sampled about 60–70k triangles versus 130–137k before, with comparable draw calls. Mobile sampled about 39–47k triangles before the final entrance connector (approximately 800 additional triangles). Local headless Chrome reported around 90fps; this does not establish physical-phone performance. Existing DPR caps and adaptive rendering remain unchanged.
- Reading view, return to the city, reduced-motion static view, unavailable WebGL, short-screen fallback, mobile menu/Escape and navigation disposal passed. Layout checks covered 360×640, 360×800, 390×844, 768×1024, 1024×768 and 1440×900. Courses, Projects, Mentorship and Acknowledgments retained their routes, without a Mission canvas after navigation.
- Production build and whitespace checks passed. The existing large-chunk advisory remains: the lazy scene is approximately 541kB minified / 140kB gzip. No dependency, downloaded model or generated texture was added.

Local review evidence and harnesses are in the existing ignored `.mission-qa/` directory (`recording/`, `baseline/`, `final-sweep/`, `final/`, `pass2-mobile/`, `collision.json`, `regression.json`). Changes have not been committed or deployed.

The sections below record the earlier September 5 implementation.

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

