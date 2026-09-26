import {upsertOpening,type Project} from './model.ts';
import type {WallId} from './openings.ts';
export function moveOpening(p:Project,id:string,wallId:WallId,offset:number,sill?:number):Project{
 const o=p.room.fixedElements.find(o=>o.id===id);if(!o)throw new Error('Hueco no encontrado.');
 return upsertOpening(p,{...o,wallId,offset:{...o.offset,manualCm:offset},sill:sill===undefined?o.sill:{...o.sill,manualCm:sill}});
}
