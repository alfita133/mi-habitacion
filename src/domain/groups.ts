import {newId,projectSchema,type Project} from './model.ts';
import {footprint,cm} from './objects.ts';
export function members(p:Project,id:string){const o=p.objects.find(o=>o.id===id);return o?p.objects.filter(b=>o.groupId?b.groupId===o.groupId:b.id===id):[];}
export function entityBounds(p:Project,id:string){const all=members(p,id),points=all.flatMap(footprint);return {x:(Math.min(...points.map(p=>p.x))+Math.max(...points.map(p=>p.x)))/2,y:(Math.min(...points.map(p=>p.y))+Math.max(...points.map(p=>p.y)))/2,z:Math.min(...all.map(o=>o.position.z)),top:Math.max(...all.map(o=>o.position.z+cm(o.dimensions.height)))};}
const save=(p:Project)=>projectSchema.parse({...p,updatedAt:new Date().toISOString()});
export function joinObjects(p:Project,ids:string[],name:string):Project {
 const chosen=new Set(ids.flatMap(id=>members(p,id).map(o=>o.id)));if(chosen.size<2)throw new Error('Selecciona al menos dos objetos.');
 const id=newId(),oldGroups=new Set(p.objects.filter(o=>chosen.has(o.id)).map(o=>o.groupId));
 return save({...p,groups:[...p.groups.filter(g=>!oldGroups.has(g.id)),{id,name}],objects:p.objects.map(o=>chosen.has(o.id)?{...o,groupId:id,hidden:false}:o)});
}
export function ungroup(p:Project,id:string):Project {const group=p.objects.find(o=>o.id===id)?.groupId;if(!group)return p;return save({...p,groups:p.groups.filter(g=>g.id!==group),objects:p.objects.map(o=>o.groupId===group?{...o,groupId:null}:o)});}
export function translateEntity(p:Project,id:string,dx:number,dy:number,dz=0):Project {const ids=new Set(members(p,id).map(o=>o.id));return save({...p,objects:p.objects.map(o=>ids.has(o.id)?{...o,position:{x:o.position.x+dx,y:o.position.y+dy,z:o.position.z+dz}}:o)});}
export function rotateEntity(p:Project,id:string,delta:number):Project {const ids=new Set(members(p,id).map(o=>o.id)),center=entityBounds(p,id),r=delta*Math.PI/180;return save({...p,objects:p.objects.map(o=>{if(!ids.has(o.id))return o;const x=o.position.x-center.x,y=o.position.y-center.y;return {...o,rotationDeg:((o.rotationDeg+delta)%360+360)%360,position:{...o.position,x:center.x+x*Math.cos(r)-y*Math.sin(r),y:center.y+x*Math.sin(r)+y*Math.cos(r)}};})});}
export function hideEntity(p:Project,id:string,hidden:boolean):Project {const ids=new Set(members(p,id).map(o=>o.id));return save({...p,objects:p.objects.map(o=>ids.has(o.id)?{...o,hidden}:o)});}
export function deleteEntity(p:Project,id:string):Project {const ids=new Set(members(p,id).map(o=>o.id)),group=p.objects.find(o=>o.id===id)?.groupId;return save({...p,groups:p.groups.filter(g=>g.id!==group),objects:p.objects.filter(o=>!ids.has(o.id))});}
export function resetInitialHeight(p:Project,id:string):Project {const ids=new Set(members(p,id).map(o=>o.id));return save({...p,objects:p.objects.map(o=>ids.has(o.id)?{...o,dimensions:{...o.dimensions,height:{...o.dimensions.height,manualCm:o.initialHeightCm}}}:o)});}
