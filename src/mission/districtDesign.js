// Explicit commissions placed on source footprints. These are original buildings,
// never models of the Boston structures whose ground parcels they occupy.
export const commissions = {
  'w29611612-0': 'library',
  'w788015166-0': 'maker',
  'r7135707-0': 'mentorship',
  'w29741116-0': 'forum',
  'w29864884-0': 'research',
  'r16946259-0': 'beacon',
};

// A small, explicitly chosen precinct of former building parcels is reused as
// teaching courts. Their exact perimeter remains legible in the new paving.
// This creates human-scale public rooms without straightening the street grid.
export const teachingCourts = new Set([
  'w29573070-0', 'w408746568-0', 'w816253624-0', 'w108235738-0',
  'w408746566-0', 'w408746627-0', 'w29716487-0', 'w484950757-0',
]);

export function architecturalPlan(layout) {
  const towers = [];
  // Real height evidence nominates candidates. Spacing and explicit exclusions
  // choose four distinct skyline positions; all other tall originals are lowered.
  for (const f of [...layout.buildings].sort((a,b)=>(b.height||0)-(a.height||0)||a.id.localeCompare(b.id))) {
    const d = Math.hypot(...f.center);
    if (towers.length < 4 && f.area > 35 && d > 60 && d < 148 && !commissions[f.id] &&
      towers.every(t=>Math.hypot(t.center[0]-f.center[0],t.center[1]-f.center[1])>48)) towers.push(f);
  }
  const towerIds = new Set(towers.map(f=>f.id));
  return layout.buildings.map(f=> {
    const distance = Math.hypot(f.center[0],f.center[1]-22);
    const edge = Math.min(f.center[0]-layout.projection.bounds[0],layout.projection.bounds[2]-f.center[0],f.center[1]-layout.projection.bounds[1],layout.projection.bounds[3]-f.center[1]);
    const family = towerIds.has(f.id) ? 'tower' : f.area < 9 ? 'grain' :
      f.use === 'government' || f.use === 'civic' || f.use === 'church' ? 'civic' :
      f.area > 70 && f.elongation > 2.2 ? 'maker' :
      f.area > 30 && f.compactness > .65 && (f.levels||0) > 8 ? 'research' : 'academic';
    const floors = family === 'grain' ? Math.min(5,Math.max(3,f.levels||4)) :
      family === 'tower' ? 22+towers.findIndex(t=>t.id===f.id)*4 :
      family === 'research' ? 9 : family === 'civic' ? 4 : family === 'maker' ? 3 : Math.min(8,Math.max(3,f.levels||5));
    return {...f,family,floors,height:floors*.62*Math.min(1,Math.max(.2,edge/19)),detail:distance<66?0:distance<120?1:2,commission:commissions[f.id],court:teachingCourts.has(f.id)};
  });
}

export function facade(b, f, height, base=.18, { vertical=false, slab=true, detail=0, scale=1, warm=false }={}) {
  const ring=f.ring.map(([x,z])=>[f.center[0]+(x-f.center[0])*scale,f.center[1]+(z-f.center[1])*scale]);
  const step=detail ? 1.86 : .62;
  // Horizontal slab edges and widely spaced structural piers; no window texture.
  for(let i=0;i<ring.length;i++) {
    const a=ring[i],c=ring[(i+1)%ring.length], dx=c[0]-a[0],dz=c[1]-a[1],len=Math.hypot(dx,dz);
    if(len<.65) continue;
    if(slab) for(let y=base+.62;y<base+height-.1;y+=step) b.segment(a,c,'metal',.055,y,.075);
    const bays=Math.max(1,Math.floor(len/(vertical?.9:1.8)));
    if(detail===0 || vertical) for(let j=0;j<=bays;j++) {
      const t=j/bays;
      b.block(vertical?'stone':'dark',a[0]+dx*t,base+height/2,a[1]+dz*t,.055,height,vertical?.16:.07,-Math.atan2(dz,dx));
    }
    if(warm && i===0) b.segment([a[0]+dx*.12,a[1]+dz*.12],[a[0]+dx*.88,a[1]+dz*.88],'warm',.026,base+.4,.12);
  }
}

export function buildFamily(b, f, mobile) {
  const {family,height,detail}=f;
  if(detail===2) {
    b.solid(f,family==='grain'?'stone':'dark',height,.18);
    if(f.area>18) b.solid(f,'metal',.07,height+.18,.94);
    return;
  }
  if(family==='grain') {
    b.solid(f,'stone',height,.18);
    if(detail===0) {
      const ring=f.ring;
      for(let i=0;i<ring.length;i++) {
        const a=ring[i],c=ring[(i+1)%ring.length],dx=c[0]-a[0],dz=c[1]-a[1],length=Math.hypot(dx,dz);
        if(length<.8)continue;
        const count=Math.max(1,Math.floor(length/.85));
        for(let j=0;j<count;j++) {
          const t=(j+.5)/count;
          b.block('glass',a[0]+dx*t,.22+height/2,a[1]+dz*t,.28,height*.78,.035,-Math.atan2(dz,dx));
        }
      }
    }
    b.solid(f,'dark',.11,height+.18,.96);
    return;
  }
  const setback=family==='tower'||family==='research'||(family==='academic'&&f.compactness>.65&&f.area>14);
  const primary=setback?height*.72:height;
  b.solid(f,family==='civic'?'stone':'glass',primary,.18);
  facade(b,f,primary,.18,{vertical:family==='research'||family==='tower',slab:family!=='civic',detail:mobile?1:detail,warm:detail===0&&f.area>25});
  b.solid(f,'metal',.12,primary+.18,.99);
  if(setback) {
    b.solid(f,'glass',height-primary,primary+.3,.76);
    facade(b,f,height-primary,primary+.3,{vertical:family==='tower',detail:1,scale:.76});
    b.solid(f,'stone',.12,height+.3,.77);
    if(family==='tower') b.solid(f,'dark',1.2,height+.42,.42);
    else if(detail===0) b.solid(f,'park',.06,primary+.32,.91);
  }
  if(family==='maker'&&detail===0) {
    // Segmented roof monitors follow the longest facade instead of an arbitrary grid.
    const [x,z]=f.center;
    for(let i=-1;i<=1;i++) b.block('metal',x+i*.9,height+.42,z, .5,.28,Math.sqrt(f.area)*.4,-f.orientation);
  }
}

export function buildCourt(b,f) {
  const [x,z]=f.center;
  b.solid(f,'paving',.16,.18);
  b.solid(f,'park',.035,.345,.77);
  // A raised planted court with one stone seating edge and a light pergola.
  const a=f.ring[0],c=f.ring[1];
  b.segment(a,c,'stone',.23,.47,.32);
  const width=Math.min(3.6,Math.sqrt(f.area)*.55);
  for(const dx of [-width/2,width/2]) b.block('dark',x+dx,1.18,z,.055,1.7,.055);
  for(let i=0;i<5;i++)b.block('metal',x,2.08,z-.7+i*.35,width+.2,.065,.10);
  b.block('stone',x,.43,z+.85,width,.14,.3);
  return 2.2;
}

export function buildCommission(b, f) {
  const [x,z]=f.center;
  b.solid(f,'paving',.18,.16);
  switch(f.commission) {
    case 'library': {
      // Reading room beneath a thick floating roof, book stack at its west end.
      b.solid(f,'glass',2.7,.4,.88);
      facade(b,f,2.7,.4,{scale:.88,slab:false,warm:true});
      b.solid(f,'stone',.3,3.1,.98);
      b.block('stone',x-3.6,3.4,z,2.3,6,4.8);
      for(let j=0;j<6;j++) b.block('dark',x-4.65+j*.4,3.6,z+2.43,.13,5.3,.22);
      b.block('glass',x+.3,4.15,z-1.1,4.9,1.8,2.1);
      b.block('metal',x+.3,5.13,z-1.1,5.1,.16,2.3);
      b.block('park',x+2,3.32,z+1.3,3.6,.07,1.2);
      for(let i=0;i<4;i++)b.block('stone',x+1,.22+i*.045,z+2.85-i*.18,6.8,.09,.3);
      return 6.5;
    }
    case 'maker': {
      // Two long-span halls occupy the irregular civic parcel. Each roof tooth
      // has an exposed portal frame, sloping panel and a north-light clerestory.
      b.solid(f,'dark',.65,.34,.96);
      b.block('dark',x,2.5,z-6.5,10,3.6,.14);
      for(const dx of [-5,5])b.block('glass',x+dx,2.5,z,.08,3.6,13);
      for(let i=0;i<=5;i++) {
        const xx=x-5+i*2;
        for(const zz of [z-6.5,z+6.5])b.block('stone',xx,2.5,zz,.15,4.3,.22);
        b.block('metal',xx,4.65,z,.16,.24,13.4);
        if(i<5) {
          b.block('metal',xx+1,4.92,z,2.13,.12,13.3,0,.28);
          b.block('glass',xx+2,4.91,z,.05,.58,13.1);
          b.block('warm',xx+1,3.8,z+6.49,1.5,.06,.04);
          b.block('stone',xx+1,.9,z+4.7,.9,.12,1.2);
          b.block('dark',xx+1,.62,z+4.7,.12,.5,.8);
          b.block('metal',xx+1,1.45,z+3.7,.4,1,.55);
          if(i!==2)b.block('glass',xx+1,1.15,z+6.42,1.78,1.4,.05);
        }
      }
      b.block('stone',x,5.9,z-6.8,10.2,1.2,1.4);
      b.block('glass',x,1.7,z+7.2,7,2.6,1.1);
      b.block('metal',x,3.1,z+7.2,7.4,.2,1.5);
      // Occupied gallery spans the real gap to the neighbouring learning wing.
      b.block('metal',22.3,2.45,13.8,1.3,.15,6.3,.02);
      b.block('glass',21.7,2.9,13.8,.05,.8,6.3,.02);
      b.block('glass',22.9,2.9,13.8,.05,.8,6.3,.02);
      b.block('stone',22.3,3.38,13.8,1.45,.12,6.6,.02);
      return 6.6;
    }
    case 'mentorship': {
      // Preserve the parcel's courtyard hole; a slender folded garden canopy.
      b.solid(f,'park',.06,.36,.98);
      b.block('stone',x+1.5,.55,z+1.5,3,.25,4.8,.55);
      b.block('glass',x+2.1,1.5,z-1,1.8,2.2,4.4);
      for(const dx of [-2,2]) for(const dz of [-2.5,2.5])b.block('metal',x+dx,1.85,z+dz,.07,2.8,.07);
      b.block('stone',x,3.3,z,5.6,.14,6.5,0,.08);
      b.block('metal',x,3.35,z, .12,.2,6.7);
      b.block('warm',x,3.08,z+2.8,4.4,.045,.06);
      return 3.7;
    }
    case 'forum': {
      // Terraced public forum, one open side faces the existing street. The
      // fan of seating is a gathering space, not an ornamental circle.
      b.solid(f,'stone',.3,.35,.98);
      b.solid(f,'paving',.08,.65,.78);
      for(let i=0;i<5;i++) {
        b.block('stone',x-1.5+i*.42,.73+i*.0425,z-1, .48,.12+i*.085,5.1,-.28);
      }
      b.block('stone',x-2.5,2.3,z-2.9,5.1,.24,1.4,-.28);
      for(const dx of [-4,-.8])b.block('dark',x+dx,1.45,z-2.9,.12,2.2,.12);
      b.block('warm',x-1.8,2.17,z-2.3,3.7,.035,.04,-.28);
      return 2.7;
    }
    case 'research': {
      // A short institute with three offset occupied terraces. Taller than its
      // immediate neighbours, subordinate to the destination beacon.
      b.solid(f,'stone',1.2,.34,.96);
      b.solid(f,'glass',8,1.54,.83);
      facade(b,f,8,1.54,{vertical:true,scale:.83,slab:false});
      b.solid(f,'stone',.22,9.54,.86);
      b.solid(f,'glass',3.7,9.76,.60);
      facade(b,f,3.7,9.76,{vertical:true,scale:.60,slab:false});
      b.solid(f,'stone',.2,13.46,.63);
      b.solid(f,'dark',1.8,13.66,.36);
      return 15.6;
    }
    case 'beacon': {
      // Split, offset blades joined by occupied sky rooms. The open crown is
      // architectural space; a single recessed warm seam marks the destination.
      b.solid(f,'stone',2,.34,.96);
      b.solid(f,'glass',4,2.34,.83);
      facade(b,f,4,2.34,{scale:.83});
      b.block('limestone',x-1.9,18,z,2.4,32,4.3);
      b.block('glass',x+.65,13.8,z,2.8,23.6,4);
      b.block('metal',x+1.4,25.6,z-1,1.4,3.2,2);
      for(const dx of [-2.8,-2.2,-1.6,-1]) b.block('dark',x+dx,18,z+2.18,.07,30,.14);
      b.block('stone',x,25.6,z,3.6,.42,4.4);
      b.block('stone',x,19,z,3.6,.36,4.3);
      b.block('beaconWarm',x-.62,18,z+2.23,.09,30,.045);
      b.block('light',x+.65,25.34,z+2.24,1.7,.07,.04);
      return 34.2;
    }
  }
}
