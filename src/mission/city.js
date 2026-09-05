import * as T from "three";
import brandLogo from "../logos/brand-trim.png";


export function createCity(scene, mobile) {
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set();
  const batches = new Map();
  const geometry = (g) => {
    geometries.add(g);
    return g;
  };
  const material = (options) => {
    const m = new T.MeshStandardMaterial(options);
    materials.add(m);
    return m;
  };
  const stone = material({ color: "#304b61", roughness: 0.7 });
  const porcelain = material({
    color: "#527087",
    roughness: 0.85,
    metalness: 0.15,
  });
  const glass = material({
    color: "#29475f",
    metalness: 0.25,
    roughness: 0.4,
  });
  const dark = material({ color: "#0b1929", roughness: 0.65 });
  const path = material({ color: "#172b3a", roughness: 0.85 });
  const blue = material({
    color: "#66c2d1",
    emissive: "#3999b1",
    emissiveIntensity: 0.6,
    roughness: 0.4,
  });
  const districtLights = ["learn", "build", "guide"].map((id) => ({
    id,
    material: material({
      color: "#8cdbd7",
      emissive: "#4baea9",
      emissiveIntensity: 0.3,
    }),
  }));
  const warm = material({
    color: "#d3b58d",
    emissive: "#bc9164",
    emissiveIntensity: 0.5,
  });
  const green = material({ color: "#24574b", roughness: 1 });
  const lawn = material({ color: "#163f38", roughness: 1 });
  const box = geometry(new T.BoxGeometry(1, 1, 1));
  const sphere = geometry(new T.SphereGeometry(1, mobile ? 8 : 12, 8));
  const cylinder = geometry(new T.CylinderGeometry(1, 1, 1, 64));
  const dummy = new T.Object3D();

  function instance(g, m, x, y, z, sx, sy, sz, rotation = 0) {
    const key = `${g.uuid}:${m.uuid}`;
    if (!batches.has(key)) batches.set(key, { g, m, transforms: [] });
    dummy.position.set(x, y, z);
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set(0, rotation, 0);
    dummy.updateMatrix();
    batches.get(key).transforms.push(dummy.matrix.clone());
  }
  const block = (m, x, y, z, w, h, d, r = 0) =>
    instance(box, m, x, y, z, w, h, d, r);
  const disk = (m, x, y, z, radius, height) =>
    instance(cylinder, m, x, y, z, radius, height, radius);
  function mesh(g, m, position) {
    const obj = new T.Mesh(g, m);
    obj.position.set(...position);
    scene.add(obj);
    return obj;
  }
  function line(points, m, radius = 0.09) {
    const curve = new T.CatmullRomCurve3(
      points.map((p) => new T.Vector3(...p)),
    );
    mesh(
      geometry(new T.TubeGeometry(curve, 80, radius, 5, false)),
      m,
      [0, 0, 0],
    );
    return curve;
  }
  function walkway(points, m, width) {
    const curve = new T.CatmullRomCurve3(
      points.map((p) => new T.Vector3(...p)),
    );
    const positions = [],
      indices = [],
      p = new T.Vector3(),
      tangent = new T.Vector3();
    for (let i = 0; i <= 100; i++) {
      curve.getPoint(i / 100, p);
      curve.getTangent(i / 100, tangent);
      const normal = new T.Vector3(-tangent.z, 0, tangent.x)
        .normalize()
        .multiplyScalar(width / 2);
      positions.push(
        p.x + normal.x,
        p.y,
        p.z + normal.z,
        p.x - normal.x,
        p.y,
        p.z - normal.z,
      );
      if (i < 100) {
        const k = i * 2;
        indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
      }
    }
    const g = geometry(new T.BufferGeometry());
    g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    const surface = mesh(g, m, [0, 0, 0]);
    surface.receiveShadow = true;
    return curve;
  }
  // A terraced campus island, with a quiet reflecting water plane around it.
  const water = material({
    color: "#081b2b",
    metalness: 0.65,
    roughness: 0.28,
  });
  mesh(
    geometry(new T.PlaneGeometry(2400, 2400)),
    water,
    [0, -1.6, 0],
  ).rotation.x = -Math.PI / 2;
  disk(dark, 0, -1, 10, 92, 2);
  disk(path, 0, -1, -133, 140, 1.4);
  disk(stone, 0, 0.1, 10, 89, 0.35);
  disk(path, 0, 0.32, 10, 84, 0.12);
  disk(stone, 0, 0.45, 10, 79, 0.2);
  const shore = geometry(new T.TorusGeometry(89, 0.09, 5, 128));
  mesh(shore, blue, [0, 0.28, 10]).rotation.x = Math.PI / 2;

  const windowLight = material({ color: "#426777", emissive: "#497283", emissiveIntensity: 0.25, roughness: 0.35 });
  const metal = material({ color: "#35566b", metalness: 0.8, roughness: 0.3 });
  function building(x, z, w, h, d) {
    block(stone, x, 0.75, z, w + 2, 1.1, d + 2);
    block(glass, x, h / 2 + 1, z, w, h, d);
    // Deep floor reveals, recessed windows and asymmetric solid service cores.
    block(stone, x - w * 0.37, h / 2 + 1, z, w * 0.25, h + 0.3, d + 0.25);
    for (let floor = 0, y = 1.3; y < h; y += 3.3, floor++) {
      block(metal, x, y, z, w + 0.45, 0.18, d + 0.45);
      for (let j = 0; j < Math.floor(w / 2); j++) {
        if ((j * 7 + floor * 3 + Math.round(x)) % 5 > 1) continue;
        block(windowLight, x - w / 2 + 1.2 + j * 2, y + 1.25, z + d / 2 + 0.015, 1.25, 0.85, 0.035);
      }
      for (let j = 0; j < Math.floor(d / 2); j++) {
        if ((j + floor * 3) % 5 > 1) continue;
        block(windowLight, x + w / 2 + 0.015, y + 1.25, z - d / 2 + 1.2 + j * 2, 0.035, 0.85, 1.25);
        block(windowLight, x - w / 2 - 0.015, y + 1.25, z - d / 2 + 1.2 + j * 2, 0.035, 0.85, 1.25);
      }
    }
    for (let dx = -w / 2; dx <= w / 2; dx += 2.1) {
      block(dark, x + dx, h / 2 + 1, z + d / 2 + 0.12, 0.11, h, 0.32);
      block(metal, x + dx, h / 2 + 1, z - d / 2 - 0.12, 0.11, h, 0.32);
    }
    block(stone, x, h + 1.2, z, w + 0.8, 0.4, d + 0.8);
    block(dark, x, h + 1.45, z, w - 0.6, 0.15, d - 0.6);
    block(metal, x - w * 0.2, h + 2.1, z, w * 0.3, 1.1, d * 0.35);
    block(blue, x, 1.4, z + d / 2 + 0.15, w, 0.06, 0.12);
  }
  // Central tower: slender twin volumes, an open crown, and a shared skybridge.
  building(4, -15, 11, 49, 12);
  building(17, -19, 8, 39, 11);
  block(porcelain, 10, 34, -17, 19, 1, 7);
  block(glass, 10, 35.4, -17, 19, 1.8, 6);
  block(blue, 4, 50.9, -15, 11.5, 0.18, 12.5);
  block(porcelain, -0.6, 54, -15, 0.45, 7, 11);
  block(porcelain, 8.6, 54, -15, 0.45, 7, 11);
  block(porcelain, 4, 57.5, -15, 9.6, 0.45, 11);
  block(blue, 4, 57.76, -9.45, 9.6, 0.05, 0.05);
  // Official artwork sits on an architectural plaque, without redrawing it.
  let disposed = false;
  const logoTexture = new T.TextureLoader().load(brandLogo, (texture) => {
    if (disposed) texture.dispose();
  });
  logoTexture.colorSpace = T.SRGBColorSpace;
  textures.add(logoTexture);
  const logoMaterial = new T.MeshBasicMaterial({
    map: logoTexture,
    transparent: true,
    side: T.DoubleSide,
  });
  materials.add(logoMaterial);
  const plaqueBacking = material({ color: "#d3dee4", roughness: 0.85 });
  block(plaqueBacking, 4, 43.7, -8.84, 10.2, 3.9, 0.18);
  mesh(
    geometry(new T.PlaneGeometry(9.7, 3.47)),
    logoMaterial,
    [4, 43.7, -8.72],
  );

  // Open learning center: offset library terraces and a planted reading roof.
  building(-26, 8, 21, 10, 17);
  building(-30, 1, 13, 31, 11);
  building(-43, -9, 8, 39, 10);
  // Tall library sun-breaks create a strong near-field edge during the descent.
  for (let x = -36; x < -23; x += 1.7) block(metal, x, 18, 7.2, 0.22, 34, 1.25);
  block(districtLights[0].material, -23.25, 20, 7.9, 0.08, 22, 0.08);
  block(porcelain, -23, 7, 19, 25, 0.5, 7);
  block(districtLights[0].material, -23, 7.3, 22.55, 25, 0.1, 0.1);
  for (let x = -34; x < -11; x += 4) block(stone, x, 3.7, 21, 0.35, 6, 0.35);
  // Workshop: an open construction frame, sawtooth roof and modular prototypes.
  for (let x = 15; x <= 39; x += 4) {
    block(metal, x, 8, 5, 0.4, 15, 0.4);
    block(metal, x, 8, 22, 0.4, 15, 0.4);
    block(metal, x, 15.3, 13.5, 0.35, 0.45, 18);
    block(districtLights[1].material, x, 15.56, 13.5, 0.06, 0.06, 17);
  }
  block(metal, 27, 15.3, 5, 25, 0.45, 0.45);
  block(metal, 27, 15.3, 22, 25, 0.45, 0.45);
  for (let i = 0; i < 5; i++) {
    block(stone, 17 + i * 4.7, 12.9, 11, 3.6, 0.25, 10);
    block(glass, 18.5 + i * 4.7, 13.7, 14, 0.15, 1.5, 16);
  }
  building(43, 5, 8, 17, 10);
  // Project lab: long-span workshop halls and cantilevered prototype gallery.
  block(dark,26,1.1,14,24,0.8,17);
  block(glass,26,5.5,6,23,8,0.25);
  block(stone,15,5.5,14,0.35,8,16);
  // Work benches and unfinished components can be seen through the open bays.
  for(let i=0;i<4;i++) {
    const x=18+i*5;
    block(stone,x,2.7,17,3,0.35,4.5);
    block(metal,x,1.9,17,2,1.5,3);
    block(glass,x,4.2,16,1.8,2.7,1.8);
    block(districtLights[1].material,x,5.6,16,1.9,0.04,1.9);
    block(metal,x,5.8,9,2.8,0.3,0.3);
    block(metal,x+1.2,4.8,9,0.25,2,0.25);
  }
  // A low annex and staggered frame give the workshop a different silhouette.
  block(stone,39,3.6,15,4,5,12);
  block(metal,30,10,17,15,0.25,0.25);

  for (let x = 17; x < 39; x += 4) {
    block(warm, x, 10.8, 21, 1.6, 0.04, 0.1);
  }
  // Community pavilion: a circular canopy with an open colonnade.
  disk(stone, 22, 1, 44, 13, 0.8);
  disk(dark, 22, 1.65, 44, 10, 0.4);
  disk(lawn, 22, 1.9, 44, 7, 0.15);
  disk(stone, 22, 2.1, 44, 3, 0.3);
  disk(porcelain, 22, 7, 44, 14, 0.65);
  const canopyLight = geometry(new T.TorusGeometry(13.8, 0.045, 5, 72));
  mesh(canopyLight, districtLights[2].material, [22, 7.35, 44]).rotation.x =
    Math.PI / 2;
  disk(lawn, 22, 7.4, 44, 11, 0.15);
  // A stepped outdoor amphitheatre beside the open pavilion.
  for (let i = 0; i < 4; i++) disk(i % 2 ? stone : dark, 39, 0.8 + i * 0.26, 49, 6.5 - i, 0.26);
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    block(
      porcelain,
      22 + Math.cos(angle) * 12,
      4,
      44 + Math.sin(angle) * 12,
      0.3,
      6,
      0.3,
    );
  }
  // Pedestrian skywalks connect the three real educational destinations.
  const transit = walkway(
    [
      [-58, 6, 4],
      [-30, 6, -7],
      [0, 6, 0],
      [27, 6, 32],
      [49, 6, 45],
      [70, 6, 18],
    ],
    porcelain,
    2.1,
  );
  line(
    [
      [-58, 6.8, 4],
      [-30, 6.8, -7],
      [0, 6.8, 0],
      [27, 6.8, 32],
      [49, 6.8, 45],
      [70, 6.8, 18],
    ],
    blue,
    0.07,
  );
  [-52, -30, -10, 12, 39, 63].forEach((x, i) =>
    block(stone, x, 3, [2, -7, -3, 12, 42, 30][i], 0.45, 6, 0.45),
  );
  const roads = [
    [
      [-73, 0.65, 40],
      [-42, 0.65, 30],
      [-10, 0.65, 29],
      [9, 0.65, 37],
      [4, 0.65, 63],
      [-10, 0.65, 84],
    ],
    [
      [63, 0.65, -37],
      [49, 0.65, -9],
      [44, 0.65, 17],
      [56, 0.65, 43],
      [43, 0.65, 73],
    ],
    [
      [-65, 0.65, -35],
      [-41, 0.65, -25],
      [-12, 0.65, -38],
      [22, 0.65, -36],
      [47, 0.65, -24],
    ],
  ];
  roads.forEach((points) => {
    walkway(points, dark, 3);
    line(
      points.map(([x, y, z]) => [x, y + 0.05, z]),
      blue,
      0.035,
    );
  });
  // Campus skyline has deliberate setbacks; no random towers fill the plazas.
  [
    [-49, -26, 13, 23, 12],
    [-23, -38, 14, 26, 12],
    [3, -47, 16, 20, 13],
    [30, -40, 13, 26, 12],
    [48, -15, 11, 18, 15],
    [-53, 8, 10, 14, 15],
    [-37, -57, 14, 17, 11],
    [37, -58, 11, 15, 12],
    [-62, -10, 9, 12, 12],
  ].forEach((args) => building(...args));
  if (!mobile)
    [
      [-60, -100, 18, 26, 17],
      [-30, -112, 13, 33, 13],
      [7, -125, 17, 39, 15],
      [39, -118, 16, 29, 16],
      [67, -92, 16, 24, 14],
      [-92, -64, 17, 18, 14],
      [98, -55, 14, 21, 15],
    ].forEach((args) => building(...args));

  // Public learning plaza: seating, a reflecting pool, work tables, and people.
  disk(porcelain, -6, 0.8, 52, 16, 0.4);
  disk(dark, -8, 1.05, 43, 6, 0.12);
  disk(water, -8, 1.13, 43, 5.5, 0.12);
  const sculpture = mesh(
    geometry(new T.TorusGeometry(3, 0.18, 8, 48)),
    porcelain,
    [-8, 4.5, 43],
  );
  sculpture.rotation.y = 0.4;
  [-10, 0, 9].forEach((x, i) => {
    const z = 56 + (i % 2) * 5;
    block(stone, x, 1.6, z, 4, 0.3, 1.6);
    block(dark, x, 1.15, z, 2.8, 0.6, 0.8);
    block(glass, x, 2.05, z, 1, 0.65, 0.08);
    block(porcelain, x, 1.84, z + 0.4, 1, 0.04, 0.6);
    block(porcelain, x, 1.05, z + 2, 4, 0.4, 0.7);
  });
  function tree(x, z, size = 1) {
    disk(stone, x, 0.85, z, 1.8 * size, 0.4);
    instance(
      cylinder,
      dark,
      x,
      2.2 * size,
      z,
      0.16 * size,
      3 * size,
      0.16 * size,
    );
    // Broad, overlapping crowns soften the silhouette without alpha foliage.
    instance(sphere, green, x, 4.1 * size, z, 1.25 * size, 1.2 * size, 1.2 * size);
    instance(sphere, green, x - 0.85 * size, 3.55 * size, z + 0.2 * size, 1.1 * size, 0.85 * size, 1.0 * size);
    instance(sphere, green, x + 0.7 * size, 3.6 * size, z - 0.3 * size, 1.05 * size, 0.95 * size, 1.15 * size);
  }
  for (let i = 0; i < (mobile ? 28 : 60); i++) {
    const a = i * 2.39996;
    const radius = 61 + Math.sin(i * 8) * 9;
    const x = Math.cos(a) * radius,
      z = 12 + Math.sin(a) * radius;
    if (!(x > -24 && x < 30 && z > 55)) tree(x, z, 0.7 + (i % 4) * 0.12);
  }
  [
    [-22, 48],
    [-20, 58],
    [10, 49],
    [10, 68],
    [32, 61],
    [-45, 21],
    [-41, 18],
    [11, 27],
  ].forEach(([x, z]) => tree(x, z));
  // Four monuments follow a walkable arc at the edge of the public plaza.
  const monumentPositions = [
    [-27, 57],
    [-35, 53],
    [-43, 47],
    [-49, 39],
  ];
  const monumentLights = [];
  monumentPositions.forEach(([x, z], index) => {
    block(stone, x, 0.85, z, 4, 0.5, 3);
    block(porcelain, x, 3.4, z, 2.3, 5.4, 0.65);
    const lightMaterial = material({
      color: "#5095c5",
      emissive: "#2c93ee",
      emissiveIntensity: 0.4,
    });
    block(lightMaterial, x, 3.5, z + 0.34, 0.1, 4.5, 0.06);
    monumentLights.push(lightMaterial);
  });
  line(
    [
      [-23, 0.9, 62],
      [-31, 0.9, 57],
      [-40, 0.9, 51],
      [-49, 0.9, 43],
      [-55, 0.9, 34],
    ],
    blue,
    0.09,
  );

  // Distant academic wings fade into the same blue-hour atmosphere.
  if (!mobile) {
    [[-80,-157,12,34,15],[-44,-182,15,45,17],[0,-192,13,37,14],[43,-170,16,49,13],[91,-145,12,32,14]].forEach(args=>building(...args));
  }
  // Foreground architecture belongs to the campus perimeter, so it remains
  // visible again in the final aerial. These facades pass close to the camera.
  building(60, 69, 12, 40, 15);
  for(let x=54;x<=66;x+=1.5) block(metal,x,22,76.8,0.13,38,0.5);
  block(stone,60,41.9,69,11,0.3,14);
  block(glass,60,43.2,66,8,2.4,7);
  building(-40, 69, 13, 26, 14);
  building(70, 26, 9, 30, 15);
  block(metal, 52, 19, 62, 29, 0.7, 3.5);
  block(glass, 52, 20, 62, 29, 1.2, 2.8);
  block(blue, 52, 19.45, 63.8, 29, 0.07, 0.08);
  [38, 66].forEach(x => block(stone, x, 9.5, 62, 0.5, 19, 0.5));
  // The paths converge in the public plaza, physically connecting each idea.
  [
    [[-26, 0.8, 20], [-28, 0.8, 33], [-8, 0.8, 52]],
    [[26, 0.8, 24], [15, 0.8, 31], [-8, 0.8, 52]],
    [[22, 0.8, 54], [9, 0.8, 61], [-8, 0.8, 52]],
  ].forEach(points => { walkway(points, path, 2.5); line(points.map(([x,y,z]) => [x,y+0.04,z]), blue, 0.035); });
  for(let i=0;i<4;i++) disk(i % 2 ? stone : dark, -8, 0.65+i*0.16, 43, 10-i*1.1, 0.17);
  // Calm information pulses along the elevated learning path.
  const signals = Array.from({length: mobile ? 2 : 4}, () => {
    const signal = mesh(sphere, blue, [0,0,0]); signal.scale.setScalar(0.16); return signal;
  });
  for (let i=0;i<18;i++) {
    const angle=i/18*Math.PI*2;
    const x=22+Math.cos(angle)*17, z=44+Math.sin(angle)*17;
    if (x > 34 && z > 55) continue;
    tree(x,z,0.8+(i%3)*0.2);
    block(dark,x+1.8,1.5,z,0.12,2,0.12);
    block(warm,x+1.8,2.55,z,0.25,0.13,0.25);
  }
  for (const { g, m, transforms } of batches.values()) {
    const batch = new T.InstancedMesh(g, m, transforms.length);
    transforms.forEach((matrix, i) => batch.setMatrixAt(i, matrix));
    batch.castShadow = m !== blue;
    batch.receiveShadow = true;
    scene.add(batch);
  }
  return {
    update(time, progress, hover) {
      const motion = 1 - T.MathUtils.smoothstep(progress, 0.86, 1);
      signals.forEach((signal, i) => {
        transit.getPoint((time * 0.012 + i / signals.length) % 1, signal.position);
        signal.position.y += 0.14;
        signal.visible = motion > 0.05;
      });
      blue.emissiveIntensity =
        0.5 + Math.sin(time * 0.6) * 0.05 * motion + (hover ? 0.1 : 0);
      districtLights.forEach(({ id, material: light }) => {
        const arrival = { learn: 0.30, build: 0.43, guide: 0.55 }[id];
        light.emissiveIntensity = 0.4 + Math.max(0, 1 - Math.abs(progress - arrival) / 0.1) * 0.6;
      });
      monumentLights.forEach((m, i) => {
        m.emissiveIntensity =
          0.25 +
          Math.max(0, 1 - Math.abs(progress - (0.765 + i * 0.035)) / 0.025) *
            1.4;
      });
    },
    dispose() {
      disposed = true;
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
