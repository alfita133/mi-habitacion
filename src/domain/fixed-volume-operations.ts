import {projectSchema,type Project} from './model.ts';
import type {FixedVolume} from './fixed-volumes.ts';
export function upsertFixedVolume(p:Project,v:FixedVolume):Project{
 const volumes=p.room.fixedVolumes.some(o=>o.id===v.id)?p.room.fixedVolumes.map(o=>o.id===v.id?v:o):[...p.room.fixedVolumes,v];
 return projectSchema.parse({...p,room:{...p.room,fixedVolumes:volumes},updatedAt:new Date().toISOString()});
}
export function removeFixedVolume(p:Project,id:string):Project{
 return projectSchema.parse({...p,room:{...p.room,fixedVolumes:p.room.fixedVolumes.filter(v=>v.id!==id)},updatedAt:new Date().toISOString()});
}
