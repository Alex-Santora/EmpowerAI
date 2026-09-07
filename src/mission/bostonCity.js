import * as T from 'three';
import { createBatches, inside } from './worldGeometry.js';
import { architecturalPlan, buildFamily, buildCommission, buildCourt } from './districtDesign.js';
import { createCameraRig } from './camera.js';

export function createBostonCity(scene, mobile, layout, { massing = false } = {}) {
  const b = createBatches(scene);
  b.mat('ground',{color:'#323a3c',roughness:1});
  b.mat('road',{color:'#111b23',roughness:.95});
  b.mat('paving',{color:'#555f63',roughness:.95});
  b.mat('park',{color:'#253e33',roughness:1});
  b.mat('water',{color:'#081521',roughness:.25,metalness:.55});
  b.mat('stone',{color:'#777c7b',roughness:.88});
  b.mat('dark',{color:'#20272d',roughness:.72,metalness:.25});
  b.mat('glass',{color:'#344d5b',roughness:.27,metalness:.48,envMapIntensity:.85});
  b.mat('metal',{color:'#53616a',roughness:.55,metalness:.5});
  b.mat('light',{color:'#83bec6',emissive:'#70a8b5',emissiveIntensity:.35});
  b.mat('warm',{color:'#c6aa7b',emissive:'#ac8755',emissiveIntensity:.28,roughness:.7});
  b.mat('leaf',{color:'#344f42',roughness:1});
  b.mat('limestone',{color:'#a0a49c',roughness:.86});
  b.mat('beaconWarm',{color:'#d1b681',emissive:'#c6a369',emissiveIntensity:.85});
  // Broad neutral terrain extends beyond the extraction; water and fog mask its edge.
  b.block('ground',0,-.3,0,2400,.5,2400);
  for(const w of layout.water) {
    b.solid(w,'water',.035,.015);
    // Continue water beyond an extraction edge, so it never looks like a map tile.
    const [west,north,east,south]=layout.projection.bounds;
    for(let i=0;i<w.ring.length;i++) {
      const a=w.ring[i],c=w.ring[(i+1)%w.ring.length];
      let d;
      if(Math.abs(a[0]-west)<.01&&Math.abs(c[0]-west)<.01)d=[-1000,0];
      if(Math.abs(a[0]-east)<.01&&Math.abs(c[0]-east)<.01)d=[1000,0];
      if(Math.abs(a[1]-north)<.01&&Math.abs(c[1]-north)<.01)d=[0,-1000];
      if(Math.abs(a[1]-south)<.01&&Math.abs(c[1]-south)<.01)d=[0,1000];
      if(d)b.solid({ring:[a,c,[c[0]+d[0],c[1]+d[1]],[a[0]+d[0],a[1]+d[1]]]},'water',.035,.015);
    }
  }
  for(const p of layout.greens) b.solid(p,'park',.06,.045);
  for(const p of layout.plazas) b.solid(p,'paving',.08,.05);
  for(const road of layout.roads) {
    const width={major:1.75,secondary:1.1,local:.65,pedestrian:.35}[road.kind];
    b.ribbon(road.points,road.kind==='pedestrian'?'paving':'road',width,.17);
  }
  const colliders = [], plan=architecturalPlan(layout);
  const camera=new T.PerspectiveCamera(),rig=createCameraRig(camera),pointer=new T.Vector2(),route=[];
  for(const compact of [false,true]) for(let i=0;i<=400;i++) {
    rig(i/400,0,pointer,compact);route.push(camera.position.clone());
  }
  const counts={};
  for(const f of plan) {
    if(mobile && Math.hypot(...f.center)>145 && f.area<8) continue;
    // Lower occupied floors in the existing flight corridor, retaining all
    // original footprints. No carved-out imaginary street through the city.
    if(!f.commission && f.family!=='tower') {
      const radius=Math.sqrt(f.area)*.8+3;
      for(const p of route) if(Math.hypot(p.x-f.center[0],p.z-f.center[1])<radius)f.height=Math.max(1.24,Math.min(f.height,p.y-2.4));
    }
    let height=f.height;
    if(massing)b.solid(f,'stone',height,.18);
    else if(f.commission)height=buildCommission(b,f);
    else if(f.court)height=buildCourt(b,f);
    else buildFamily(b,f,mobile);
    counts[f.commission||f.family]=(counts[f.commission||f.family]||0)+1;
    colliders.push({...f,height});
  }
  if(!massing) {
    const trunks=[];
    const roadCells=new Map();
    for(const road of layout.roads)for(let i=1;i<road.points.length;i++) {
      const a=road.points[i-1],c=road.points[i],r={major:1.1,secondary:.8,local:.55,pedestrian:.38}[road.kind];
      for(let x=Math.floor((Math.min(a[0],c[0])-r)/8);x<=Math.floor((Math.max(a[0],c[0])+r)/8);x++)
        for(let z=Math.floor((Math.min(a[1],c[1])-r)/8);z<=Math.floor((Math.max(a[1],c[1])+r)/8);z++) {
          const key=`${x},${z}`;if(!roadCells.has(key))roadCells.set(key,[]);roadCells.get(key).push({a,c,r});
        }
    }
    const onRoad=(x,z)=>(roadCells.get(`${Math.floor(x/8)},${Math.floor(z/8)}`)||[]).some(({a,c,r})=>{
      const dx=c[0]-a[0],dz=c[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
      return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<r;
    });
    const occupied=(x,z)=>plan.some(f=>!f.court&&Math.abs(x-f.center[0])<Math.sqrt(f.area)*2&&Math.abs(z-f.center[1])<Math.sqrt(f.area)*2&&inside([x,z],f.ring)&&!f.holes.some(h=>inside([x,z],h)));
    function tree(x,z,form,scale=1,base=.15) {
      const h=(form===0?1.75:form===1?1.35:.85)*scale;
      b.put('cylinder','dark',x,base+h*.44,z,.025*scale,h*.88,.025*scale);
      if(form===0) {
        b.put('cone','leaf',x,base+h*.72,z,.27*scale,h*.9,.26*scale);
        b.put('cone','leaf',x,base+h*.58,z,.34*scale,h*.64,.30*scale);
      } else {
        b.put('leaf','leaf',x-.13*scale,base+h*.84,z,.33*scale,h*.32,.27*scale,.3);
        b.put('leaf','leaf',x+.2*scale,base+h*.76,z+.09,.27*scale,h*.24,.33*scale,.8);
        if(!mobile)b.put('leaf','leaf',x+.04,base+h*.99,z-.14,.23*scale,h*.28,.27*scale);
      }
      trunks.push([x,z]);
    }
    let count=0;
    for(const p of layout.greens) {
      const minX=Math.min(...p.ring.map(v=>v[0])),maxX=Math.max(...p.ring.map(v=>v[0]));
      const minZ=Math.min(...p.ring.map(v=>v[1])),maxZ=Math.max(...p.ring.map(v=>v[1]));
      // Groves occupy park edges and selected landscape rooms; open lawns remain.
      const spacing=mobile?3.5:2.45;
      for(let x=minX+.65;x<maxX-.3;x+=spacing)for(let z=minZ+.65;z<maxZ-.3;z+=spacing) {
        if(count>(mobile?1000:2200))break;
        if(!inside([x,z],p.ring)||p.holes.some(h=>inside([x,z],h))||occupied(x,z)||onRoad(x,z))continue;
        const edge=Math.min(x-minX,maxX-x,z-minZ,maxZ-z);
        if(edge>3.2 && Math.sin(x*.27)+Math.cos(z*.21)<.95)continue;
        if(trunks.some(p=>Math.hypot(p[0]-x,p[1]-z)<1.05))continue;
        const form=Math.abs(Math.floor(x/18)+Math.floor(z/14))%3;
        tree(x+.2*Math.sin(z),z+.2*Math.cos(x),form,.9+(count%3)*.12);count++;
        if(!mobile && count%3===0) {
          b.put('leaf','park',x+.7,.3,z+.2,.35,.15,.55);
          for(let j=0;j<3;j++)b.put('cone','leaf',x+.45+j*.15,.29,z+.5,.06,.24,.05);
        }
      }
    }
    // Human-scale furniture and landscape are commissioned with the six anchors.
    for(const f of plan.filter(f=>f.commission)) {
      const [x,z]=f.center;
      for(const [dx,dz]of [[-2,2],[2,1.6]]) {
        const px=x+dx,pz=z+dz;
        if(f.commission==='mentorship')tree(px,pz,2,.8,.38);
        b.block('warm',px,.43,pz,.7,.055,.18);
        for(const offset of [-.23,.23])b.block('dark',px+offset,.33,pz,.035,.18,.14);
        b.put('cylinder','dark',px+.5,.64,pz+.2,.035,.23,.027);
        b.put('leaf','stone',px+.5,.80,pz+.2,.044,.05,.045);
        // A pair of legs is enough to distinguish people from light bollards.
        for(const dx of [-.016,.016])b.block('dark',px+.5+dx,.47,pz+.2,.018,.15,.02);
      }
    }
    for(const f of plan.filter(f=>f.court)) {
      const [x,z]=f.center;
      tree(x-.6,z+.6,2,.85,.39);tree(x+.9,z-.5,0,.65,.39);
      b.put('leaf','leaf',x-1,.49,z-.4,.45,.13,.3);
      if(!mobile)for(let j=0;j<5;j++)b.put('cone','leaf',x-1+j*.17,.54,z+.6,.055,.27,.06);
    }
    // A handful of selected existing pedestrian ways become intermittent inlays.
    const spine=[[-27,8],[-18,14],[0,18],[18,15],[35,23],[32,35],[23,42],[17,49],[3,47],[-13,50]];
    for(const road of layout.roads)if(road.kind==='pedestrian') {
      const center=road.points[0];
      if(center[0]<-37||center[0]>38||center[1]<-4||center[1]>58)continue;
      if(!spine.some(p=>Math.hypot(p[0]-center[0],p[1]-center[1])<4))continue;
      for(let i=1;i<road.points.length;i++) {
        const a=road.points[i-1],c=road.points[i];if(Math.hypot(c[0]-a[0],c[1]-a[1])<.7)continue;
        b.segment([a[0]*.8+c[0]*.2,a[1]*.8+c[1]*.2],[a[0]*.35+c[0]*.65,a[1]*.35+c[1]*.65],'light',.022,.19,.018);
      }
    }
  }
  b.finish();
  return { update(time){b.materials.get('warm').emissiveIntensity=.28+Math.sin(time*.09)*.015;},dispose:b.dispose,colliders,volumes:b.volumes,stats:{buildings:colliders.length,massing,families:counts} };
}
