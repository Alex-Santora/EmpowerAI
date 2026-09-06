import * as T from "three";
import brandLogo from "../logos/brand-trim.png";
// Authored campus around the existing camera. Approximately one metre per unit,
// with a consistent 3.3m occupied floor module. No random massing or lit rooms.
export function createCity(scene, mobile) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  const objects = [], batches = new Map();
  const geometry = (g) => {
    geometries.add(g);
    return g;
  };
  const material = (options) => {
    const m = new T.MeshStandardMaterial(options);
    materials.add(m);
    return m;
  };
  // Six reusable families: structure, panels, glass, ground, light, planting.
  const dark = material({
    color: "#0b1929",
    roughness: .72,
    metalness: .3
  });
  const metal = material({
    color: "#35566b",
    roughness: .48,
    metalness: .65
  });
  const stone = material({
    color: "#304b61",
    roughness: .88
  });
  const panel = material({
    color: "#527087",
    roughness: .78,
    metalness: .12
  });
  const glass = material({
    color: "#29475f",
    roughness: .22,
    metalness: .48,
    envMapIntensity: 1.1
  });
  const clearGlass = material({
    color: "#29475f",
    roughness: .18,
    metalness: .35,
    transparent: true,
    opacity: .32,
    depthWrite: false,
    envMapIntensity: .8
  });
  const interior = material({
    color: "#426777",
    emissive: "#497283",
    emissiveIntensity: .16,
    roughness: .44
  });
  const path = material({
    color: "#172b3a",
    roughness: .95
  });
  const water = material({
    color: "#081b2b",
    metalness: .65,
    roughness: .28
  });
  const blue = material({
    color: "#66c2d1",
    emissive: "#3999b1",
    emissiveIntensity: .45,
    roughness: .4
  });
  const green = material({
    color: "#24574b",
    roughness: 1
  });
  const lawn = material({
    color: "#163f38",
    roughness: 1
  });
  const districtLights = [
    "learn",
    "build",
    "guide"
  ].map((id) => ({
    id,
    material: material({
      color: "#8cdbd7",
      emissive: "#4baea9",
      emissiveIntensity: .3
    })
  }));
  const box = geometry(new T.BoxGeometry(1, 1, 1));
  const cylinder = geometry(new T.CylinderGeometry(1, 1, 1, 16));
  const round = geometry(new T.CylinderGeometry(1, 1, 1, 80));
  const leaf = geometry(new T.IcosahedronGeometry(1, 1));
  const dummy = new T.Object3D();
  function instance(g, m, x, y, z, sx, sy, sz, ry = 0, rz = 0) {
    const key = `${g.uuid}:${m.uuid}`;
    if (!batches.has(key)) batches.set(key, {
      g,
      m,
      transforms: []
    });
    dummy.position.set(x, y, z);
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set(0, ry, rz);
    dummy.updateMatrix();
    batches.get(key).transforms.push(dummy.matrix.clone());
  }
  const block = (m, x, y, z, w, h, d, ry = 0, rz = 0) => instance(box, m, x, y, z, w, h, d, ry, rz);
  const disk = (m, x, y, z, r, h) => instance(round, m, x, y, z, r, h, r);
  const column = (x, z, bottom, top, r = .16, m = metal) => instance(cylinder, m, x, (bottom + top) / 2, z, r, top - bottom, r);
  function mesh(g, m, position = [0, 0, 0]) {
    const obj = new T.Mesh(g, m);
    obj.position.set(...position);
    scene.add(obj);
    objects.push(obj);
    return obj;
  }
  function line(points, m, radius = .035) {
    const curve = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p)));
    mesh(geometry(new T.TubeGeometry(curve, 100, radius, 5, false)), m);
    return curve;
  }
  // Closed, thick paving ribbon. Curbs share its exact samples, so light cannot
  // float above the ground or separate from the walkway on a bend.
  function walkway(points, width = 3.2, lit = false) {
    const curve = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p)));
    const positions = [], indices = [], edge = [];
    const p = new T.Vector3(), tangent = new T.Vector3();
    for (let i = 0; i <= 100; i++) {
      curve.getPoint(i / 100, p);
      curve.getTangent(i / 100, tangent);
      const nx = -tangent.z / Math.hypot(tangent.x, tangent.z) * width / 2;
      const nz = tangent.x / Math.hypot(tangent.x, tangent.z) * width / 2;
      positions.push(p.x + nx, p.y, p.z + nz, p.x - nx, p.y, p.z - nz, p.x + nx, p.y - .22, p.z + nz, p.x - nx, p.y - .22, p.z - nz);
      edge.push(new T.Vector3(p.x + nx, p.y + .025, p.z + nz));
      if (i < 100) {
        const k = i * 4;
        indices.push(k, k + 4, k + 1, k + 1, k + 4, k + 5, k, k + 2, k + 4, k + 2, k + 6, k + 4, k + 1, k + 5, k + 3, k + 3, k + 5, k + 7, k + 2, k + 3, k + 6, k + 3, k + 7, k + 6);
      }
    }
    indices.push(0, 1, 2, 1, 3, 2, 400, 402, 401, 401, 402, 403);
    const g = geometry(new T.BufferGeometry());
    g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    mesh(g, path).receiveShadow = true;
    if (lit) mesh(geometry(new T.TubeGeometry(new T.CatmullRomCurve3(edge), 100, .025, 4, false)), blue);
    return curve;
  }
  function rail(x, y, z, w, d) {
    for (const side of [-1, 1]) {
      block(metal, x, y + 1.05, z + side * d / 2, w, .065, .065);
      for (let i = 0; i <= Math.ceil(w / 2.8); i++) block(metal, x - w / 2 + i * w / Math.ceil(w / 2.8), y + .52, z + side * d / 2, .06, 1.04, .06);
      block(metal, x + side * w / 2, y + 1.05, z, .065, .065, d);
    }
  }
  // Ordered curtain-wall bays, floor slabs and solid service cores. An explicitly
  // chosen occupied floor is one continuous band, never a field of glowing dots.
  function volume(x, z, w, floors, d, base = .7, { fins = false, litFloor = -1, core = true } = {}) {
    const h = floors * 3.3;
    block(glass, x, base + h / 2, z, w, h, d);
    if (core) block(stone, x - w * .36, base + h / 2, z, w * .28, h, d + .1);
    for (let f = 0; f <= floors; f++) {
      const y = base + f * 3.3;
      block(stone, x, y, z, w + .42, .22, d + .42);
      if (f === litFloor) {
        block(interior, x + w * .14, y + 1.55, z + d / 2 + .015, w * .63, 2.7, .025);
        block(interior, x + w / 2 + .015, y + 1.55, z, .025, 2.7, d - .6);
      }
    }
    const bays = Math.ceil(w / 2.7), sideBays = Math.ceil(d / 2.7);
    for (let i = 0; i <= bays; i++) {
      const dx = -w / 2 + i * w / bays;
      block(fins ? panel : metal, x + dx, base + h / 2, z + d / 2 + .16, fins ? .18 : .1, h, fins ? .7 : .2);
      block(metal, x + dx, base + h / 2, z - d / 2 - .08, .1, h, .18);
    }
    for (let i = 0; i <= sideBays; i++) for (const dx of [-w / 2, w / 2]) block(metal, x + dx, base + h / 2, z - d / 2 + i * d / sideBays, .18, h, .1);
    block(panel, x, base + h + .15, z, w + .65, .3, d + .65);
    block(dark, x - w * .15, base + h + .7, z - d * .18, w * .32, .8, d * .28);
  }
  function entrance(x, z, w, roof = 4.1, accent = blue) {
    block(dark, x, 2.1, z - .15, w, 2.8, .25);
    block(glass, x, 2, z + .02, w - .7, 2.6, .08);
    block(metal, x, 2, z + .1, .08, 2.6, .12);
    block(panel, x, roof, z + 1.1, w + 1.5, .25, 2.8);
    for (const dx of [-w / 2 - .45, w / 2 + .45]) column(x + dx, z + 2.15, .65, roof, .09);
    block(accent, x, roof - .14, z + 1.8, w - .5, .035, .09);
  }
  function planter(x, z, w, d, y = .7) {
    block(stone, x, y + .25, z, w, .5, d);
    block(lawn, x, y + .51, z, w - .24, .04, d - .24);
  }
  function tree(x, z, s = 1, base = .7) {
    column(x, z, base, base + 2.65 * s, .065 * s, dark);
    for (const side of [-1, 1]) block(dark, x + side * .2 * s, base + 2.1 * s, z, .05 * s, .9 * s, .05 * s, 0, -side * .5);
    instance(leaf, green, x, base + 2.75 * s, z, .66 * s, .88 * s, .58 * s);
    instance(leaf, green, x - .36 * s, base + 2.4 * s, z + .08 * s, .53 * s, .52 * s, .51 * s);
    instance(leaf, green, x + .34 * s, base + 2.55 * s, z - .07 * s, .47 * s, .64 * s, .5 * s);
  }
  function grove(x, z, w = 7, d = 3, scales = [1, .9, 1.06]) {
    planter(x, z, w, d);
    scales.forEach((s, i) => {
      const offset = (i - (scales.length - 1) / 2) / Math.max(1, scales.length - 1);
      tree(x + (w >= d ? offset * (w - 1.8) : 0), z + (w < d ? offset * (d - 1.8) : i % 2 ? .25 : -.2), s, 1.22);
    });
    if (!mobile) for (let i = 0; i < Math.floor(w); i++) instance(leaf, lawn, x - w / 2 + .6 + i, 1.45, z + d / 2 - .6, .45, .24, .35);
  }
  function bench(x, z, ry = 0) {
    block(panel, x, 1.18, z, 2.1, .14, .55, ry);
    for (const dx of [-.78, .78]) block(dark, x + Math.cos(ry) * dx, .92, z - Math.sin(ry) * dx, .12, .48, .45, ry);
  }
  function bollard(x, z) {
    block(dark, x, 1.13, z, .14, .86, .14);
    block(blue, x, 1.48, z, .15, .08, .15);
  }
  // Keep the island/water setting, with continuous ground instead of concentric
  // stacked platforms. Only the arrival promenade has a lit shoreline.
  mesh(geometry(new T.PlaneGeometry(2400, 2400)), water, [0, -1.6, 0]).rotation.x = -Math.PI / 2;
  disk(dark, 0, -.7, 10, 92, 2.3);
  disk(stone, 0, .55, 10, 89, .3);
  disk(path, 0, -.04, -133, 140, 1.4);
  line([
    [76, .73, 49],
    [57, .73, 78],
    [20, .73, 96],
    [-17, .73, 96]
  ], blue, .025);
  // LEARNING HALL: two wings, a glazed atrium and a planted reading terrace.
  // The rear book stack keeps the familiar finned near-field edge at .27–.34.
  volume(-31, 3, 13, 7, 12, .7, {
    fins: true,
    litFloor: 1
  });
  volume(-32, 13, 27, 2, 14, .7, { litFloor: 0 });
  volume(-45, -3, 9, 3, 16, .7, { fins: true });
  block(glass, -20, 7.3, 6, 7, 13.2, 10);
  for (const x of [-23.5, -20, -16.5]) block(panel, x, 7.3, 11.2, .24, 13.2, .7);
  block(panel, -20, 14.05, 6, 7.8, .3, 10.8);
  entrance(-23, 20.2, 5, 4.4, districtLights[0].material);
  rail(-32, 7.6, 15, 26, 9);
  planter(-40, 15, 6, 2.1, 7.6);
  for (const x of [-42, -40, -38]) instance(leaf, lawn, x, 8.35, 15, .7, .25, .6);
  grove(-42, 24, 7, 2.6);
  bench(-34, 23);
  bench(-30, 23);
  // RESEARCH TOWER: nested floor plates and a recessed crown. Blades terminate
  // at slabs, so the silhouette has setbacks without unsupported crown beams.
  volume(5, -16, 15, 9, 15, .7, {
    fins: true,
    litFloor: 2
  });
  volume(3, -17, 11, 3, 12, 30.4, {
    fins: true,
    litFloor: 1
  });
  volume(1, -18, 7, 2, 9, 40.3, { fins: true });
  volume(19, -18, 8, 6, 12, .7, { litFloor: 0 });
  block(stone, 6, 1, -6, 29, .6, 7);
  entrance(7, -2.5, 5, 4.4);
  block(metal, 14, 14, -17, 7, .4, 4.4);
  block(clearGlass, 14, 15.5, -17, 7, 2.6, 4);
  block(panel, 14, 16.95, -17, 7.4, .3, 4.5);
  for (const x of [11, 13, 15, 17]) for (const z of [-19.04, -14.96]) block(metal, x, 15.5, z, .07, 2.6, .1);
  let disposed = false;
  const logoTexture = new T.TextureLoader().load(brandLogo, (t) => {
    if (disposed) t.dispose();
  });
  logoTexture.colorSpace = T.SRGBColorSpace;
  textures.add(logoTexture);
  const logoMaterial = new T.MeshBasicMaterial({
    map: logoTexture,
    transparent: true
  });
  materials.add(logoMaterial);
  const plaque = material({
    color: "#d3dee4",
    roughness: .85
  });
  block(plaque, 3, 36.5, -10.82, 8.7, 3.25, .12);
  mesh(geometry(new T.PlaneGeometry(8.3, 2.96)), logoMaterial, [3, 36.5, -10.74]);
  // MAKER LAB: five complete portal bays. Sloping roof panels meet clerestories
  // and longitudinal eaves. Front glass sits behind the structural frame.
  block(stone, 27, .94, 12, 26, .48, 20);
  block(dark, 27, 4.9, 2.15, 25, 8, .3);
  block(glass, 14.7, 4.9, 12, .18, 8, 20);
  block(glass, 39.3, 4.9, 12, .18, 8, 20);
  for (let i = 0; i <= 5; i++) {
    const x = 14.5 + i * 5;
    for (const z of [2, 22]) block(metal, x, 5.05, z, .26, 8.7, .3);
    block(metal, x, 9.35, 12, .28, .4, 20.5);
  }
  for (const z of [2, 22]) block(metal, 27, 9.35, z, 25.5, .4, .35);
  for (let i = 0; i < 5; i++) {
    const x = 14.5 + i * 5, rise = 1.7;
    block(panel, x + 2.5, 10.2, 12, Math.hypot(5, rise), .22, 20.5, 0, Math.atan2(rise, 5));
    block(glass, x + 5, 10.2, 12, .12, 1.7, 20);
    block(metal, x + 5, 11.08, 12, .18, .18, 20.5);
    for (const z of [2, 7, 12, 17, 22]) block(metal, x + 5, 10.2, z, .16, 1.7, .08);
    if (i !== 2) {
      block(clearGlass, x + 2.5, 4.9, 21.88, 4.55, 7.9, .08);
      block(metal, x + 2.5, 4.9, 22.02, .09, 8, .14);
      block(dark, x + 2.5, 1.5, 22.08, 4.6, 1.5, .18);
    }
    block(metal, x + 2.5, 4.65, 22.02, 4.6, .12, .14);
    block(panel, x + 2.5, 2.02, 16, 2.4, .14, 1.1);
    for (const dx of [-.85, .85]) block(metal, x + 2.5 + dx, 1.59, 16, .08, .82, .8);
    block(interior, x + 2.5, 4.7, 2.34, 4.1, 2.2, .06);
    block(metal, x + 2.5, 8.6, 12, .05, 1.2, .05);
    block(districtLights[1].material, x + 2.5, 7.98, 12, 2.2, .045, .15);
  }
  entrance(27, 22.2, 4, 4.2, districtLights[1].material);
  volume(44, 7, 7, 3, 14, .7, { litFloor: 1 });
  // Shallow entrance steps connect the raised workshop slab to the forecourt.
  for (let i = 0; i < 3; i++) block(stone, 27, .78 + i * .16, 24 - i * .55, 4.2, .16, .6);
  grove(40, 27, 5, 2.5, [.9, 1]);
  bench(32, 26);
  // COMMONS: annular canopy on a colonnade, with a sky-lit central garden.
  disk(path, 22, .79, 44, 13, .18);
  const roofShape = new T.Shape();
  roofShape.absarc(0, 0, 12, 0, Math.PI * 2, false);
  const hole = new T.Path();
  hole.absarc(0, 0, 7.7, 0, Math.PI * 2, true);
  roofShape.holes.push(hole);
  const roof = geometry(new T.ExtrudeGeometry(roofShape, {
    depth: .42,
    bevelEnabled: false,
    curveSegments: 48
  }));
  roof.rotateX(-Math.PI / 2);
  mesh(roof, panel, [22, 6.3, 44]).castShadow = true;
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    column(22 + Math.cos(a) * 10.7, 44 + Math.sin(a) * 10.7, .7, 6.3, .12);
    block(metal, 22 + Math.cos(a) * 9.85, 6.18, 44 + Math.sin(a) * 9.85, 4.2, .24, .18, -a);
  }
  mesh(geometry(new T.TorusGeometry(7.85, .027, 4, 80)), districtLights[2].material, [22, 6.27, 44]).rotation.x = Math.PI / 2;
  disk(lawn, 22, .84, 44, 6, .2);
  for (const [x, z, s] of [
    [19, 43, .95],
    [23, 45, 1.06],
    [25, 41, .85]
  ]) tree(x, z, s, .95);
  for (const [x, z, r] of [
    [17, 52, 0],
    [26, 52, 0],
    [
      31,
      45,
      Math.PI / 2
    ],
    [
      13,
      43,
      Math.PI / 2
    ]
  ]) bench(x, z, r);
  grove(35, 54, 6, 2.7, [.85, 1, .93]);
  grove(16, 58, 5, 2.6, [.9, 1]);
  // CONNECTION INSTITUTE: foreground stepped volume and lower wing. The link
  // bears inside occupied floor plates at both ends rather than ending in air.
  volume(60, 61, 12, 8, 14, .7, {
    fins: true,
    litFloor: 1
  });
  volume(58, 59, 8, 2, 10, 27.1, { fins: true });
  volume(71, 53, 8, 3, 8, .7, { litFloor: 1 });
  block(metal, 66.5, 7.4, 55.5, 5, .36, 3.4);
  block(clearGlass, 66.5, 8.9, 55.5, 5, 2.65, 3);
  block(panel, 66.5, 10.38, 55.5, 5.4, .3, 3.5);
  for (const x of [64, 66, 68]) for (const z of [53.94, 57.06]) block(metal, x, 8.9, z, .08, 2.65, .12);
  block(blue, 66.5, 7.61, 57.1, 4.5, .04, .06);
  entrance(59, 68.2, 4);
  // Lower secondary wings frame planted courts, leaving one dominant tower.
  volume(-49, -28, 20, 3, 10, .7, { fins: true });
  volume(-54, -15, 10, 3, 17, .7);
  volume(-24, -40, 24, 4, 11, .7, { litFloor: 0 });
  volume(-30, -29, 11, 2, 10, .7);
  volume(7, -47, 24, 3, 12, .7, { fins: true });
  volume(35, -36, 13, 5, 13, .7, { fins: true });
  volume(42, -22, 22, 2, 10, .7);
  volume(64, 13, 10, 4, 18, .7, { fins: true });
  // Keep western parallax while opening the commitment view onto the plaza.
  volume(-44, 65, 16, 3, 11, .7, { litFloor: 0 });
  volume(-48, 55, 8, 2, 9, .7);
  entrance(-41, 70.7, 4);
  if (!mobile) {
    for (const [x, z, w, f, d] of [
      [-61, -100, 28, 4, 14],
      [-26, -115, 25, 5, 12],
      [10, -123, 30, 4, 15],
      [45, -110, 24, 5, 14],
      [72, -84, 20, 3, 15],
      [-89, -61, 24, 3, 12],
      [94, -49, 20, 3, 14]
    ]) volume(x, z, w, f, d);
    for (const [x, z] of [
      [-49, -151],
      [-12, -165],
      [29, -153],
      [65, -143]
    ]) volume(x, z, 26, 4, 13);
  }
  // Grounded campus spine and entrance approaches. Preserve the sweeping curve
  // language while removing the elevated ribbon that cut through the workshop.
  const transit = walkway([
    [-68, .78, 30],
    [-42, .78, 27],
    [-20, .78, 25],
    [-2, .78, 28],
    [19, .78, 29],
    [39, .78, 36],
    [40, .78, 49],
    [29, .78, 58],
    [6, .78, 60],
    [-12, .78, 59],
    [-30, .78, 57],
    [-53, .78, 42]
  ], 3.4, true);
  [
    [
      [-23, .79, 20],
      [-23, .79, 24],
      [-21, .79, 26]
    ],
    [
      [27, .79, 22],
      [27, .79, 28],
      [25, .79, 30]
    ],
    [
      [22, .79, 56],
      [22, .79, 59],
      [12, .79, 60]
    ],
    [
      [-8, .79, 57],
      [-1, .79, 52],
      [0, .79, 43],
      [-1, .79, 34],
      [-3, .79, 22],
      [-5, .79, 6],
      [7, .79, -1]
    ],
    [
      [44, .79, 40],
      [53, .79, 48],
      [53, .79, 59],
      [57, .79, 78]
    ],
    [
      [59, .79, 68.2],
      [59, .79, 71],
      [55.5, .79, 71]
    ],
    [
      [-55, .79, 28],
      [-61, .79, 9],
      [-61, .79, -22],
      [-40, .79, -22]
    ],
    [
      [-20, .79, -25],
      [-7, .79, -32],
      [20, .79, -31],
      [50, .79, -5],
      [51, .79, 27]
    ],
    [
      [-41, .79, 72],
      [-34, .79, 66],
      [-30, .79, 58]
    ]
  ].forEach((points) => walkway(points, 2.4));
  // Garden rooms occupy the space between buildings; the promenade remains
  // generous, but the campus no longer sits on an undifferentiated blue disk.
  for (const [x, z, w, d] of [
    [4, 11, 12, 15],
    [-12, 8, 5, 13],
    [-43, -17, 10, 7],
    [-19, -30, 10, 5],
    [22, -45, 5, 16],
    [18, 79, 22, 9],
    [-58, 60, 13, 9]
  ]) {
    block(path, x, .735, z, w + .3, .07, d + .3);
    block(lawn, x, .79, z, w, .06, d);
  }
  // A slim low wall and three small groves edge the southern common lawn.
  block(stone, 18, .95, 74.3, 22, .5, .4);
  grove(10, 77, 5, 2.5, [.8, .9]);
  grove(23, 78, 6, 2.5, [.9, 1, .85]);
  grove(5, 12, 5, 3, [.95, .85]);
  grove(-58, 60, 7, 2.6, [.9, 1, .95]);
  // REFLECTION PLAZA: retained ring anchored to a plinth in a quiet rectangular
  // pool. Seating and paving joints establish scale without oversized props.
  block(path, -8, .77, 47, 25, .16, 20);
  block(dark, -8, .93, 42, 13, .32, 7);
  block(water, -8, 1.105, 42, 12.4, .04, 6.4);
  block(stone, -8, 1.25, 42, 5, .4, 1.4);
  const sculpture = mesh(geometry(new T.TorusGeometry(2.9, .14, 8, 64)), panel, [-8, 4.18, 42]);
  sculpture.rotation.y = .4;
  sculpture.castShadow = true;
  for (const z of [49, 52, 55]) block(stone, -8, .86, z, 24, .018, .035);
  for (const [x, z] of [
    [-17, 53],
    [-10, 55],
    [-2, 55],
    [4, 50]
  ]) bench(x, z);
  grove(-23, 43, 3, 7, [.9, 1]);
  grove(-16, 64, 7, 2.6, [.8, .92, .86]);
  grove(4, 47, 3.1, 5, [.8, .92]);
  const monumentLights = [];
  [
    [-27, 53],
    [-34, 49],
    [-40, 43],
    [-44, 36]
  ].forEach(([x, z]) => {
    block(stone, x, .88, z, 2.8, .36, 1.8);
    block(panel, x, 2.65, z, 1.05, 3.3, .4);
    const m = material({
      color: "#5095c5",
      emissive: "#2c93ee",
      emissiveIntensity: .3
    });
    block(m, x, 2.65, z + .22, .06, 2.6, .04);
    monumentLights.push(m);
  });
  walkway([
    [-25, .79, 56],
    [-34, .79, 52],
    [-42, .79, 45],
    [-47, .79, 36]
  ], 2.3);
  // Authored groves, no polar-noise distribution or arbitrary crown scaling.
  for (const [x, z, w, d] of [
    [-55, 37, 7, 3],
    [-62, 3, 3, 7],
    [-44, -20, 8, 3],
    [-15, -27, 6, 3],
    [25, -31, 7, 3],
    [54, 26, 3, 8],
    [53, 45, 3, 7],
    [36, 72, 8, 3],
    [-31, 74, 6, 3]
  ]) grove(x, z, w, d);
  if (!mobile) for (const [x, z, w, d] of [
    [-65, 53, 6, 3],
    [68, 41, 3, 7],
    [-57, -43, 8, 3],
    [22, -59, 7, 3],
    [52, -42, 6, 3]
  ]) grove(x, z, w, d);
  for (const [x, z] of [
    [-35, 28],
    [-13, 28],
    [8, 31],
    [33, 33],
    [43, 43],
    [32, 60],
    [4, 63],
    [-27, 60],
    [-52, 40]
  ]) bollard(x, z);
  const signalGeometry = geometry(new T.SphereGeometry(.065, 6, 4));
  const signals = Array.from({ length: mobile ? 2 : 4 }, () => mesh(signalGeometry, blue));
  const unshadowed = [
    blue,
    interior,
    clearGlass,
    water,
    ...districtLights.map((d) => d.material),
    ...monumentLights
  ];
  for (const { g, m, transforms } of batches.values()) {
    const batch = new T.InstancedMesh(g, m, transforms.length);
    transforms.forEach((matrix, i) => batch.setMatrixAt(i, matrix));
    batch.castShadow = !unshadowed.includes(m);
    batch.receiveShadow = true;
    batch.computeBoundingSphere();
    scene.add(batch);
    objects.push(batch);
  }
  return {
    update(time, progress, hover) {
      const motion = 1 - T.MathUtils.smoothstep(progress, .86, 1);
      signals.forEach((signal, i) => {
        transit.getPoint((time * .012 + i / signals.length) % 1, signal.position);
        signal.position.y += .07;
        signal.visible = motion > .05;
      });
      blue.emissiveIntensity = .4 + Math.sin(time * .6) * .035 * motion + (hover ? .08 : 0);
      districtLights.forEach(({ id, material: light }) => {
        const arrival = {
          learn: .3,
          build: .43,
          guide: .55
        }[id];
        light.emissiveIntensity = .3 + Math.max(0, 1 - Math.abs(progress - arrival) / .1) * .45;
      });
      monumentLights.forEach((m, i) => {
        m.emissiveIntensity = .25 + Math.max(0, 1 - Math.abs(progress - (.765 + i * .035)) / .025) * 1.1;
      });
    },
    dispose() {
      disposed = true;
      objects.forEach((obj) => {
        scene.remove(obj);
        if (obj.isInstancedMesh) obj.dispose();
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    }
  };
}
