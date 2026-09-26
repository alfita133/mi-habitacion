import type {Project} from './model.ts';
import {members,translateEntity} from './groups.ts';
export function entitySelection(p:Project,ids:string[]):string[]{const done=new Set<string>();return ids.filter(id=>{if(done.has(id))return false;const pieces=members(p,id);for(const o of pieces)done.add(o.id);return pieces.length>0;});}
export function translateSelection(p:Project,ids:string[],dx:number,dy:number,dz=0):Project{return entitySelection(p,ids).reduce((next,id)=>translateEntity(next,id,dx,dy,dz),p);}
