import type {Room} from '../domain/model.ts';
import {roomWalls,atWall} from './outline.ts';
import type {Opening} from '../domain/openings.ts';
import {openingBounds,measured} from '../domain/openings.ts';
// Screen coordinates: tangent follows wall offset; normal points into the room.
export function doorLeaf(o:Opening,width:number,depth:number,room?:Room,limit=true){
 if(o.kind!=='door'||!o.swing)return null;
 const b=openingBounds(o),wall=room?roomWalls(room).find(w=>w.id===o.wallId):undefined;
 const horizontal=o.wallId==='north'||o.wallId==='south';
 const tangent=wall?.tangent??(horizontal?{x:1,y:0}:{x:0,y:1});
 const normal=wall?.normal??({north:{x:0,y:1},south:{x:0,y:-1},west:{x:1,y:0},east:{x:-1,y:0}}[o.wallId]??{x:0,y:1});
 const base=wall?atWall(wall,b.start):horizontal?{x:b.start,y:o.wallId==='north'?0:depth}:{x:o.wallId==='west'?0:width,y:b.start};
 const start=o.swing.hinge==='start',sign=start?1:-1,inward=o.swing.direction==='inward'?1:-1;
 const hinge={x:base.x+(start?0:tangent.x*b.width),y:base.y+(start?0:tangent.y*b.width)};
 const a=Math.min(o.swing.angleDeg,room&&limit?maxDoorAngle(o,room):180)*Math.PI/180,closed={x:sign*tangent.x,y:sign*tangent.y};
 const vector={x:closed.x*Math.cos(a)+normal.x*inward*Math.sin(a),y:closed.y*Math.cos(a)+normal.y*inward*Math.sin(a)};
 const arcPoints=Array.from({length:19},(_,i)=>{const angle=a*i/18;return {x:hinge.x+b.width*(closed.x*Math.cos(angle)+normal.x*inward*Math.sin(angle)),y:hinge.y+b.width*(closed.y*Math.cos(angle)+normal.y*inward*Math.sin(angle))};});
 const end={x:hinge.x+vector.x*b.width,y:hinge.y+vector.y*b.width};
 const sweep=closed.x*normal.y*inward-closed.y*normal.x*inward>0?1:0;
 return {id:o.id,name:o.name,hinge,end,arcPoints,closedEnd:{x:hinge.x+closed.x*b.width,y:hinge.y+closed.y*b.width},sweep,
  position:{x:(hinge.x+end.x)/2,y:(hinge.y+end.y)/2,z:b.bottom},
  rotationDeg:(Math.atan2(vector.y,vector.x)*180/Math.PI+360)%360,
  dimensions:{width:measured(b.width),depth:measured(o.swing.thicknessCm),height:measured(b.height)}};
}

// Project the pointer into the configured half-plane; never change hinge or swing side.
export function doorAngleAtPoint(o:Opening,width:number,depth:number,p:{x:number;y:number},room?:Room):number {
 const closed=doorLeaf({...o,swing:o.swing?{...o.swing,angleDeg:0}:undefined},width,depth,room,false);
 const open=doorLeaf({...o,swing:o.swing?{...o.swing,angleDeg:90}:undefined},width,depth,room,false);
 if(!closed||!open)return 0;
 const dx=p.x-closed.hinge.x,dy=p.y-closed.hinge.y;
 const along=dx*(closed.end.x-closed.hinge.x)+dy*(closed.end.y-closed.hinge.y);
 const inward=dx*(open.end.x-open.hinge.x)+dy*(open.end.y-open.hinge.y);
 return Math.round(Math.max(0,Math.min(room?maxDoorAngle(o,room):180,Math.atan2(Math.max(0,inward),along)*180/Math.PI)));
}

/** First contact of the leaf centreline with another wall, along the configured sweep. */
export function maxDoorAngle(o:Opening,room:Room):number {
 if(!o.swing)return 180;
 const walls=roomWalls(room),wall=walls.find(w=>w.id===o.wallId);if(!wall)return 180;
 const b=openingBounds(o),hinge=atWall(wall,o.swing.hinge==='start'?b.start:b.end),sign=o.swing.hinge==='start'?1:-1,side=o.swing.direction==='inward'?1:-1;
 const local=(p:{x:number;y:number})=>({x:((p.x-hinge.x)*wall.tangent.x+(p.y-hinge.y)*wall.tangent.y)*sign,y:((p.x-hinge.x)*wall.normal.x+(p.y-hinge.y)*wall.normal.y)*side});
 let limit=180;
 for(const other of walls){if(other.id===wall.id)continue;const a=local(other.start),z=local(other.end),dx=z.x-a.x,dy=z.y-a.y;
 const candidates=[a,z],aa=dx*dx+dy*dy,bb=2*(a.x*dx+a.y*dy),cc=a.x*a.x+a.y*a.y-b.width*b.width,disc=bb*bb-4*aa*cc;
 if(disc>=0)for(const t of [(-bb-Math.sqrt(disc))/(2*aa),(-bb+Math.sqrt(disc))/(2*aa)])if(t>=0&&t<=1)candidates.push({x:a.x+t*dx,y:a.y+t*dy});
 // A wall beginning exactly at the hinge must still stop a coincident leaf.
 for(const p of candidates){if(Math.hypot(p.x,p.y)<1e-6||Math.hypot(p.x,p.y)>b.width+1e-6||p.y<-1e-6)continue;const angle=Math.atan2(Math.max(0,p.y),p.x)*180/Math.PI;if(angle>1e-6)limit=Math.min(limit,angle);}
 }
 return Math.floor(limit*1000)/1000;
}
