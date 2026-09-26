import type { Opening, WallId } from '../domain/openings.ts';
import { openingBounds } from '../domain/openings.ts';
export type Box={id:string;wallId?:WallId;rotationDeg?:number;normal?:{x:number;y:number};center:{x:number;y:number;z:number};size:{x:number;y:number;z:number}};
export function wallBox(id:string,wallId:WallId,start:number,end:number,bottom:number,top:number,w:number,d:number,t:number):Box {
  const horizontal=wallId==='north'||wallId==='south';
  return {id,wallId,center:{x:horizontal?(start+end)/2:wallId==='west'?-t/2:w+t/2,y:horizontal?(wallId==='north'?-t/2:d+t/2):(start+end)/2,z:(bottom+top)/2},size:{x:horizontal?end-start:t,y:horizontal?t:end-start,z:top-bottom}};
}
/** Slice a wall into disjoint solids. No boolean CSG, hidden original wall or visual-only holes. */
export function cutWall(wallId:WallId,w:number,d:number,h:number,t:number,openings:Opening[],plan=false):Box[]{
  const horizontal=wallId==='north'||wallId==='south',length=horizontal?w:d;
  const holes=openings.filter(o=>o.wallId===wallId).map(openingBounds);
  if(!holes.length)return [wallBox(wallId,wallId,horizontal?-t:0,length+(horizontal?t:0),0,h,w,d,t)];
  const cuts=[...new Set([horizontal?-t:0,length+(horizontal?t:0),...holes.flatMap(o=>[o.start,o.end])])].sort((a,b)=>a-b),boxes:Box[]=[];
  for(let i=0;i<cuts.length-1;i++){
    const start=cuts[i],end=cuts[i+1],mid=(start+end)/2;
    const active=holes.filter(o=>o.start<mid&&o.end>mid).sort((a,b)=>a.bottom-b.bottom);
    if(plan&&active.length)continue;
    let bottom=0;
    for(const hole of active){
      if(hole.bottom>bottom)boxes.push(wallBox(`${wallId}-${boxes.length}`,wallId,start,end,bottom,hole.bottom,w,d,t));
      bottom=Math.max(bottom,hole.top);
    }
    if(bottom<h)boxes.push(wallBox(`${wallId}-${boxes.length}`,wallId,start,end,bottom,h,w,d,t));
  }
  return boxes;
}
export type StructuralBox=Box&{kind:'frame'|'glass';openingId:string};
export function openingSolids(o:Opening,w:number,d:number,t:number):StructuralBox[]{
  const b=openingBounds(o),f=Math.min(3,b.width/4,b.height/4);
  const segments:[number,number,number,number][]=[
    [b.start,b.start+f,b.bottom,b.top], [b.end-f,b.end,b.bottom,b.top], [b.start+f,b.end-f,b.top-f,b.top],
  ];
  if(o.kind==='window')segments.push([b.start+f,b.end-f,b.bottom,b.bottom+f]);
  const boxes:StructuralBox[]=segments.map(([a,z,c,e],i)=>({...wallBox(`${o.id}-frame-${i}`,o.wallId,a,z,c,e,w,d,t),kind:'frame',openingId:o.id}));
  if(o.kind==='window'){
    // Two-leaf frame, entirely inside the measured opening.
    const mid=(b.start+b.end)/2;
    boxes.push({...wallBox(`${o.id}-mullion`,o.wallId,mid-f/2,mid+f/2,b.bottom+f,b.top-f,w,d,t),kind:'frame',openingId:o.id});
    const glass=wallBox(`${o.id}-glass`,o.wallId,b.start+f,b.end-f,b.bottom+f,b.top-f,w,d,t);
    if(o.wallId==='north'||o.wallId==='south')glass.size.y=Math.min(1,t);else glass.size.x=Math.min(1,t);
    boxes.push({...glass,kind:'glass',openingId:o.id});
  }
  return boxes;
}
