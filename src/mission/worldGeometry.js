import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function shapeOf({ ring, holes = [] }, center = [0, 0], scale = 1) {
  const coords = points => points.map(([x, z]) => new T.Vector2(center[0] + (x - center[0]) * scale, -(center[1] + (z - center[1]) * scale)));
  const shape = new T.Shape(coords(ring));
  shape.holes = holes.map(points => new T.Path(coords(points)));
  return shape;
}

export function inside([x, z], ring) {
  let result = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > z) !== (b[1] > z) && x < (b[0]-a[0]) * (z-a[1]) / (b[1]-a[1]) + a[0]) result = !result;
  }
  return result;
}

// Geometry is merged by material AND spatial tile; distant tiles remain culled.
// Repeated structural pieces share instanced buffers, never React components.
export function createBatches(scene) {
  const merged = new Map(), instances = new Map(), materials = new Map(), objects = [], volumes = [];
  const primitive = { box: new T.BoxGeometry(1, 1, 1), leaf: new T.IcosahedronGeometry(1, 0), cone: new T.ConeGeometry(1, 1, 5), cylinder: new T.CylinderGeometry(1, 1, 1, 6) };
  const dummy = new T.Object3D();
  const tile = (x, z) => `${Math.floor(x/90)},${Math.floor(z/90)}`;
  const mat = (name, options) => {
    const m = new T.MeshStandardMaterial(options); materials.set(name, m); return name;
  };
  function add(g, material, x = 0, z = 0) {
    const key = `${material}:${tile(x,z)}`;
    if (!merged.has(key)) merged.set(key, { material, geometries: [] });
    if (g.index) { const source = g; g = source.toNonIndexed(); source.dispose(); }
    g.deleteAttribute('uv');
    merged.get(key).geometries.push(g);
  }
  function solid(feature, material, height = .1, base = 0, scale = 1) {
    const center = feature.center || feature.ring.reduce((a,p)=>[a[0]+p[0]/feature.ring.length,a[1]+p[1]/feature.ring.length],[0,0]);
    const g = new T.ExtrudeGeometry(shapeOf(feature, center, scale), { depth: height, bevelEnabled: false, steps: 1, curveSegments: 1 });
    g.rotateX(-Math.PI/2); g.translate(0,base,0);
    add(g, material, ...center);
    if(import.meta.env.DEV && base+height>1) {
      const transform=points=>points.map(([x,z])=>[center[0]+(x-center[0])*scale,center[1]+(z-center[1])*scale]);
      volumes.push({id:feature.id,ring:transform(feature.ring),holes:(feature.holes||[]).map(transform),base,top:base+height});
    }
  }
  function put(type, material, x, y, z, sx, sy, sz, ry = 0, rz = 0) {
    const key = `${type}:${material}:${tile(x,z)}`;
    if (!instances.has(key)) instances.set(key, { type, material, matrices: [] });
    dummy.position.set(x,y,z); dummy.scale.set(sx,sy,sz); dummy.rotation.set(0,ry,rz); dummy.updateMatrix();
    instances.get(key).matrices.push(dummy.matrix.clone());
  }
  const block = (material,x,y,z,w,h,d,ry=0,rz=0) => put('box',material,x,y,z,w,h,d,ry,rz);
  function segment(a,b,material,width,y=.08,height=.05) {
    const dx=b[0]-a[0], dz=b[1]-a[1], length=Math.hypot(dx,dz);
    if(length<.001) return;
    block(material,(a[0]+b[0])/2,y,(a[1]+b[1])/2,length+width*.15,height,width,-Math.atan2(dz,dx));
  }
  function ribbon(points,material,width,y=.16) {
    if(points.length<2)return;
    const positions=[],indices=[];
    for(let i=0;i<points.length;i++) {
      const previous=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];
      const dx=next[0]-previous[0],dz=next[1]-previous[1],len=Math.hypot(dx,dz)||1;
      const nx=-dz/len*width/2,nz=dx/len*width/2,[x,z]=points[i];
      positions.push(x+nx,y,z+nz,x-nx,y,z-nz);
      if(i<points.length-1){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
    add(g,material,...points[0]);
  }
  function finish() {
    for (const {material,geometries} of merged.values()) {
      const g = mergeGeometries(geometries); geometries.forEach(g=>g.dispose());
      if (!g) throw new Error('Incompatible world geometry');
      g.computeBoundingSphere();
      const mesh = new T.Mesh(g,materials.get(material)); mesh.castShadow = !['water','ground','road','park','paving','light','warm'].includes(material); mesh.receiveShadow = true;
      scene.add(mesh); objects.push(mesh);
    }
    for (const {type,material,matrices} of instances.values()) {
      const mesh = new T.InstancedMesh(primitive[type],materials.get(material),matrices.length);
      matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix)); mesh.computeBoundingSphere();
      mesh.castShadow = !['water','ground','road','park','paving','light','warm'].includes(material); mesh.receiveShadow = true;
      scene.add(mesh); objects.push(mesh);
    }
  }
  return { mat, solid, block, put, segment, ribbon, add, finish, materials, volumes,
    dispose() {
      objects.forEach(o=>{scene.remove(o);if(o.isInstancedMesh)o.dispose();else o.geometry.dispose();});
      Object.values(primitive).forEach(g=>g.dispose()); materials.forEach(m=>m.dispose());
    }
  };
}
