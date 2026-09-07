import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gzipSync } from 'node:zlib';
import { architecturalPlan, commissions } from '../src/mission/districtDesign.js';
const raw=fs.readFileSync(new URL('../public/world/boston-layout.json',import.meta.url));
const world=JSON.parse(raw);
assert.equal(world.source.license,'ODbL-1.0');
assert.equal(world.source.url,'https://www.openstreetmap.org/copyright');
assert.match(world.source.sha256,/^[a-f0-9]{64}$/);
const [west,north,east,south]=world.projection.bounds;
function checkPoint(p){assert.equal(p.length,2);assert(p.every(Number.isFinite));assert(p[0]>=west-.001&&p[0]<=east+.001&&p[1]>=north-.001&&p[1]<=south+.001);}
for(const name of ['buildings','greens','plazas','water']) {
 assert(world[name].length>0,name);assert.equal(new Set(world[name].map(f=>f.id)).size,world[name].length);
 for(const f of world[name])for(const ring of [f.ring,...f.holes]){assert(ring.length>=3);ring.forEach(checkPoint);}
}
for(const road of world.roads){assert(['major','secondary','local','pedestrian'].includes(road.kind));assert(road.points.length>=2);road.points.forEach(checkPoint);}
assert(world.buildings.some(f=>f.holes.length),'Courtyards retained');
for(const id of Object.keys(commissions))assert(world.buildings.some(f=>f.id===id),`Missing commissioned parcel ${id}`);
const plan=architecturalPlan(world);assert.deepEqual(plan,architecturalPlan(world));
assert.equal(new Set(plan.map(f=>f.family)).size,6);
assert.equal(plan.filter(f=>f.family==='tower').length,4);
assert.equal(plan.filter(f=>f.commission).length,6);
assert(plan.every(f=>Number.isFinite(f.height)&&f.height>0));
console.log(JSON.stringify({valid:true,bytes:raw.length,gzipBytes:gzipSync(raw).length,buildings:world.buildings.length,roads:world.roads.length,commissions:6,skylineTowers:6,sourceTimestamp:world.source.osmTimestamp},null,2));
