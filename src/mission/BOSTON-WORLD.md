# Boston geometry / FutureWithAI architecture

## Audit before modification

Baseline: clean working tree at `2a319b1` (`city upgrade`). The entire Mission directory was also copied to the ignored `.mission-qa/boston-before/`. `city.js` remains intact for comparison and rollback.

| System | Existing implementation / preservation boundary |
| --- | --- |
| Page hierarchy | `App.jsx` lazy `/` route → `MissionPage.jsx` → lazy `MissionScene.jsx`; semantic chapters and navigation stay in DOM. |
| Scene | Direct Three.js, no React Three Fiber. One scene/camera/renderer per effect. `city.js` supplies create/update/dispose. |
| Old environment | Authored rectangular volumes, round ground platforms, fixed paths, shared box/cylinder/leaf instances, six campus landmarks. |
| Camera | `camera.js`: nonuniform cubic Hermite interpolation, fourteen position/target control points in `timeline.js`; subtle idle and mouse offsets. |
| Scroll | `MissionPage.jsx`: native 1300svh rail → 0–1 progress → exponential damping at rate 6. Chapter fades share that progress. |
| Animation | RAF camera and a handful of city lights; visibility pause. No scene animation library. |
| Postprocessing | None. ACES filmic tone mapping, exposure 1.05. |
| Materials | `city.js`: shared standard materials, reflection glass, restrained emissive strips, foliage. |
| Lighting | `MissionScene.jsx`: hemisphere, directional key/rim, two local lights, PMREM sky strip, exponential depth fog, cached 2048 shadow map. |
| Mobile | Width ≤700, FOV58, 1.25 camera pullback, DPR1.2, no shadows; existing low-memory/data-saver/short-screen reading behavior. |
| Reduced motion | Static aerial city with semantic reading flow. WebGL/import failure retains SVG and complete copy. |
| Performance | Lazy WebGL chunk, geometry/material sharing, instancing, no per-building React nodes, capped DPR, adaptive DPR/shadows, complete disposal. |

## Implementation sequence

1. Development-only targeted Overpass importer; compact static polygons with source hash and license.
2. Basic massing, roads, green space, water. Save and inspect a geometry checkpoint before facade work.
3. Fit the world and selected real blocks to the existing route; preserve interpolation and timings.
4. Six architectural families and six designed anchors: learning forum, maker hall, library, mentorship garden, research tower, destination beacon.
5. Clustered landscape, physical scale, material hierarchy; shared/merged spatial batches and mobile reductions.
6. Review each narrative composition, oblique/aerial views, camera clearance, lifecycle and responsive behavior; production build.

## Art direction

Keep Manrope, all copy, DOM presentation and existing dark atmosphere. Material palette: charcoal structure `#20272d`, mineral stone `#777c7b`, blue-grey glass `#344d5b`, muted planting `#344f42`, warm interior `#c6aa7b`, restrained cyan inlay `#83bec6`. The signature is the contrast between tightly folded real blocks and generous public rooms, with a split stone-and-glass beacon recurring along the journey. No map labels or historical replicas.

## Rebuild

The only development dependency is Shapely; there are no new npm or browser dependencies.

```powershell
python -m venv .venv-gis
.venv-gis\Scripts\python.exe -m pip install -r scripts/requirements-gis.txt
.venv-gis\Scripts\python.exe scripts/generate-boston-world.py --fetch
```

To work offline, place **one file** at `data/raw/boston-overpass.json`: the JSON response to the `QUERY` in the importer, including `out geom` geometries. Then run the last command without `--fetch`. The extraction already succeeded for this revision; no manual data download is needed. Raw JSON is approximately 10.6 MB and ignored by Git. The production layout is approximately 1.99 MB / 473 KB gzip. Its returned OSM snapshot timestamp is **2026-07-24T11:04:51Z**, which is recorded as received rather than represented as current live map data.

The original crop is retained: 42.350–42.371 N, -71.075–-71.045 E. Equirectangular coordinates use WGS84 radius, origin [-71.060,42.3605], X east, Z south, and .16 scene units per metre. Height and level tags inform classification; architecture intentionally compresses the skyline to six notable towers. Real buildings are not reproduced literally.

The importer resolves split/reversed multipolygon members, preserves holes, suppresses successfully assembled relation-member duplicates, clips and simplifies geometry, separates four road classes, and reconstructs coastal water faces from directed coastline ways. It drops unrelated tags, street names, and underground tunnel ways. Open, unassembled ways are not silently closed into invented footprints. `source.sha256` identifies the exact raw source used for reproducibility.

## Geometry checkpoint

Before architectural work, basic masses, streets, parks and coast were integrated and reviewed at every mission stop plus top, aerial, east and north views. Saved evidence: `.mission-qa/boston-checkpoint/` and `.mission-qa/boston-massing/`. The checkpoint established that the street/block geometry works; it also revealed why unchanged old-building look-at heights obscured the new public spaces. A second import produced an identical SHA-256 (`61F0C053B76177039386808AA88CD23ACCE40E6A82AE1C427F0E80055B4B3B1A`).

## Scene implementation

- `bostonCity.js`: consumes only the local asset, lays out terrain/roads/water, creates architectural and landscape batches, and owns update/disposal.
- `districtDesign.js`: six families (academic, research, tower, maker, civic, narrow urban grain); deterministic assignment uses area, compactness, elongation, source levels, distance and edge position. Four spaced tower candidates join the research institute and beacon as six skyline accents. Eight explicit parcels become teaching courts, retaining their real perimeter in paving.
- `worldGeometry.js`: shared materials, triangulated/extruded footprint shapes with holes, merged spatial batches, instanced structural elements and planting. Roads are ribbon buffers, not thousands of individual objects. Development-only solid-volume records support clearance tests.
- `MissionScene.jsx`: asynchronously loads the layout with cancellation, retains the existing renderer, reflections, lighting and adaptive rendering. The fog matches the background to remove the old horizon seam. Crossing the mobile breakpoint rebuilds the reduced geometry, not just the pixel ratio.
- `CityBackdrop.jsx`: uses an 80 KB still rendered from this exact district. Reading, data-saver and unavailable-WebGL views retain the same environment identity.

`city.js` is preserved unchanged and is no longer included by the active renderer. The complete pre-change Mission directory is additionally saved in `.mission-qa/boston-before/`; Git baseline `2a319b1` provides a durable revert point.

## Compositions and camera

| Stop | Text / environmental focus |
| --- | --- |
| Arrival | Existing left copy, distant split-crown beacon on the right, urban blocks in the foreground. |
| Ecosystem | Approach over the tight grain toward the public campus, keeping the beacon as continuity. |
| Learn | Right copy; library's floating roof, finned book stack and planted reading terrace sit left. |
| Build | Left copy; maker hall's structural roof bays, open workshop facade and elevated gallery occupy the center/right. |
| Guidance | Left copy; folded garden canopy and teaching courts open within the real irregular block. |
| Human purpose | Right copy; lower planted courts and terraced public forum occupy the left/center. |
| Commitment | Left copy; forum, research institute and adjoining street reveal the public district. |
| Grow | Left quote; broad district and waterfront composition with the beacon to the right. |

All fourteen progress values, every camera X/Z position, the Hermite interpolation, native scroll mapping, damping, pointer behavior and UI transitions are unchanged. Middle camera elevations increase by 1–5 units for clearance. Look-at points are locally adjusted for the new lower architecture; the final look-at moves left to leave the district on the right of the quote. No orbiting, camera resets or new animation system is introduced.

Near/middle/far tiers retain full facade rhythm, simplified bands and silhouette-only geometry respectively. Small far buildings and secondary planting are reduced on mobile; shadows remain disabled, DPR capped, and all six landmarks retained. Plants include narrow multi-level conifers, branched deciduous crowns, ornamental trees, shrubs and grass clumps. Groves respect park polygons, buildings and road clearance; overlapping park polygons do not duplicate adjacent trees. Sparse furniture and abstract people use the same scaled dimensional system.

## Validation

```powershell
node scripts/verify-boston-world.mjs
.venv-gis\Scripts\python.exe scripts/test_boston_import.py
npm.cmd run build
```

The data verifier checks bounds, finite geometry, identities, attribution, courtyard presence, all commissioned parcels, deterministic family assignment, six families and four secondary towers. Importer fixtures cover coordinate handedness, joined/reversed multipolygons with holes, rejecting open polygons and unit parsing.

The saved browser clearance harness tests 2,001 positions each for desktop and mobile against the actual scaled/extruded solid tiers, courtyard holes, and instanced physical boxes. It passes with no collisions; a preliminary conservative full-footprint/full-height check overestimated the research tower volume and was replaced by checks of its actual stepped geometry.

Browser regression checks cover the eight semantic chapters, all CTAs, manual reading and return, reduced-motion static rendering, unavailable WebGL, mobile menu/Escape, 360×800, 390×844, 768×1024, 1024×768, 1440×900, short-screen reading, and removal of WebGL on Courses/Projects/Mentorship/Acknowledgments navigation. Headless GPU figures are local measurements only; physical-phone performance and deployment are not verified.

Final visual review includes 51 desktop positions (every 2% of the journey), 16 mobile positions, the initial massing checkpoint and aerial/east/north oblique views both with and without atmosphere. No browser errors or horizontal overflow were reported. Desktop samples render approximately 242–477k triangles; mobile samples 143–284k, with 86–183 mobile draw calls. The larger geographic scene costs more than the old small campus; merging, spatial culling, silhouette tiers and mobile reductions keep the difference bounded. Local headless Chrome measured 74–90fps across the final desktop sweep; that is not a physical-device guarantee.

Production build and `git diff --check` pass. Vite retains its existing large lazy-chunk advisory (approximately 544 KB / 141 KB gzip for the Three.js scene). The original `city.js` and `camera.js` hashes match the preserved baseline. Mission copy changes consist solely of the OSM attribution line; unrelated route implementation, package manifests, official assets, SEO and analytics are untouched. Nothing was committed or deployed.

Review artifacts remain in ignored `.mission-qa/boston-final/`, `.mission-qa/boston-final-mobile/`, `.mission-qa/boston-final-atmosphere/`, `.mission-qa/boston-collision.json`, and `.mission-qa/regression.json`. The extraction and renderer are ordinary tracked source/assets and do not depend on these QA files.

