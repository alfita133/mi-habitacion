import { effectiveDimensions, type Room } from '../domain/model.ts';
import {roomWalls,roomOutline,signedArea,atWall} from './outline.ts';
import type {Box} from './openings.ts';
import { cutWall, openingSolids } from './openings.ts';
export type { Box } from './openings.ts';
export function roomGeometry(room:Room){
  const {width:w,depth:d,height:h}=effectiveDimensions(room),t=room.wallThicknessCm;
  const wRoom=w;
  const frames=roomWalls(room);
  const transform=(box:Box,wall:typeof frames[number]):Box=>{const p=atWall(wall,box.center.x,box.center.y);return {...box,wallId:wall.id,center:{...p,z:box.center.z},rotationDeg:Math.atan2(wall.tangent.y,wall.tangent.x)*180/Math.PI,normal:wall.normal};};
  const walls=(plan=false)=>room.shape==='rectangle'?['north','south','west','east'].map(id=>frames.find(w=>w.id===id)!).flatMap(w=>cutWall(w.id,wRoom,d,h,t,room.fixedElements,plan).map(b=>({...b,normal:w.normal}))):frames.flatMap(w=>cutWall('north',w.length,0,h,t,room.fixedElements.filter(o=>o.wallId===w.id).map(o=>({...o,wallId:'north'})),plan).map(b=>{const start=Math.max(0,b.center.x-b.size.x/2),end=Math.min(w.length,b.center.x+b.size.x/2);return {...b,center:{...b.center,x:(start+end)/2},size:{...b.size,x:end-start}};}).map(b=>transform({...b,id:`${w.id}-${b.id}`},w)));
  const outline=roomOutline(room),area=Math.abs(signedArea(outline));
  return {width:w,depth:d,height:h,outline,
    walls:walls(),planWalls:walls(true),
    structural:room.shape==='rectangle'?room.fixedElements.flatMap(o=>openingSolids(o,w,d,t)):room.fixedElements.flatMap(o=>{const wall=frames.find(w=>w.id===o.wallId)!;return openingSolids({...o,wallId:'north'},wall.length,0,t).map(b=>({...transform(b,wall),kind:b.kind,openingId:b.openingId}));}),
    floor:{id:'floor',center:{x:w/2,y:d/2,z:-t/2},size:{x:w+2*t,y:d+2*t,z:t}},
    ceiling:{id:'ceiling',center:{x:w/2,y:d/2,z:h+t/2},size:{x:w+2*t,y:d+2*t,z:t}},
    areaM2:area/10000,volumeM3:area*h/1000000};
}
