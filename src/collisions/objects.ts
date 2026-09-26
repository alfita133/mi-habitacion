import {outsideOutline} from './outline.ts';
import {convexOverlap,outsideRoom} from './convex.ts';
import {objectSolids,solidFootprint,type Solid} from '../geometry/object-parts.ts';
import { cm,footprint,type CollisionBody,type MovableObject } from '../domain/objects.ts';
import type { Room } from '../domain/model.ts';
// Contact is allowed; numerical tolerance is one millionth of a centimetre.
export const EPS=1e-6;
function solidOverlap(a:Solid,b:Solid):boolean {
 if(a.position.z+cm(a.dimensions.height)<=b.position.z+EPS||b.position.z+cm(b.dimensions.height)<=a.position.z+EPS)return false;
 if(a.shape!=='box'||b.shape!=='box')return convexOverlap(a,b);
 const ap=solidFootprint(a),bp=solidFootprint(b);
 for(const poly of [ap,bp])for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],length=Math.hypot(q.x-p.x,q.y-p.y),axis={x:-(q.y-p.y)/length,y:(q.x-p.x)/length};
  const pa=ap.map(p=>p.x*axis.x+p.y*axis.y),pb=bp.map(p=>p.x*axis.x+p.y*axis.y);
  if(Math.max(...pa)<=Math.min(...pb)+EPS||Math.max(...pb)<=Math.min(...pa)+EPS)return false;
 }
 return true;
}
export function overlaps(a:CollisionBody,b:CollisionBody):boolean {
 // Cheap enclosing boxes first, then physical pieces, never the hollow envelope alone.
 if(!solidOverlap({...a,shape:'box',partId:a.id},{...b,shape:'box',partId:b.id}))return false;
 return objectSolids(a).some(sa=>objectSolids(b).some(sb=>solidOverlap(sa,sb)));
}
export function objectIssues(room:Pick<Room,'dimensions'>&Partial<Pick<Room,'shape'|'vertices'>>,objects:CollisionBody[]):string[]{
 const issues:string[]=[],ids=new Set<string>();
 for(const [i,o] of objects.entries()){
  if(ids.has(o.id))issues.push('ID de objeto duplicado.');ids.add(o.id);
  if(objectSolids(o).some(s=>outsideRoom(s,cm(room.dimensions.width),cm(room.dimensions.depth),cm(room.dimensions.height))||(room.shape==='polygon'&&outsideOutline(s,{...room,shape:room.shape}))))issues.push(`${o.name}: el objeto debe quedar dentro de la habitación, entre suelo y techo.`);
  for(const b of objects.slice(0,i))if(overlaps(o,b))issues.push(`${o.name} colisiona con ${b.name}.`);
 }
 return issues;
}
// Continuous SAT along a straight translation prevents dragging through thin objects.
export function sweptOverlap(a:MovableObject,to:MovableObject,b:MovableObject):boolean {
 if(a.position.z+cm(a.dimensions.height)<=b.position.z+EPS||b.position.z+cm(b.dimensions.height)<=a.position.z+EPS)return false;
 let enter=0,leave=1;const ap=footprint(a),bp=footprint(b);
 for(const angle of [a.rotationDeg,b.rotationDeg])for(const offset of [0,90]){
  const r=(angle+offset)*Math.PI/180,x=Math.cos(r),y=Math.sin(r),pa=ap.map(p=>p.x*x+p.y*y),pb=bp.map(p=>p.x*x+p.y*y);
  const low=Math.min(...pb)-Math.max(...pa)+EPS,high=Math.max(...pb)-Math.min(...pa)-EPS,v=(to.position.x-a.position.x)*x+(to.position.y-a.position.y)*y;
  if(Math.abs(v)<EPS){if(low>=0||high<=0)return false;continue;}
  enter=Math.max(enter,Math.min(low/v,high/v));leave=Math.min(leave,Math.max(low/v,high/v));
  if(enter>=leave)return false;
 }
 return enter<leave&&leave>0&&enter<1;
}

export function collisionWarnings(room:Room,objects:MovableObject[]):Map<string,string[]> {
 const warnings=new Map<string,string[]>();
 const fixed=room.fixedVolumes??[];
 const add=(id:string,message:string)=>warnings.set(id,[...(warnings.get(id)??[]),message]);
 for(const [i,o] of objects.entries()){
  for(const other of fixed)if(overlaps(o,other)){add(o.id,`Colisión con ${other.name} (fijo).`);add(other.id,`Colisión con ${o.name}${o.hidden?' (oculto)':''}.`);}
  for(const message of objectIssues(room,[o]))add(o.id,message);
  for(const other of objects.slice(0,i))if(!(o.groupId&&o.groupId===other.groupId)&&overlaps(o,other)){
   add(o.id,`Colisión con ${other.name}${other.hidden?' (oculto)':''}.`);add(other.id,`Colisión con ${o.name}${o.hidden?' (oculto)':''}.`);
  }
 }
 for(const [i,o] of fixed.entries()){
  for(const message of objectIssues(room,[o]))add(o.id,message);
  for(const other of fixed.slice(0,i))if(overlaps(o,other)){add(o.id,`Colisión con ${other.name}.`);add(other.id,`Colisión con ${o.name}.`);}
 }
 return warnings;
}
