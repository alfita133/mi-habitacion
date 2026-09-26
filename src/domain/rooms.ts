import {z} from 'zod';
import {createProject,newId,parseProject,projectSchema,type Project} from './model.ts';
export type RoomCollection={version:1;activeId:string;projects:Project[]};
export function parseCollection(data:unknown):RoomCollection{
 const raw=z.object({version:z.literal(1),activeId:z.string().uuid(),projects:z.array(z.unknown()).min(1)}).strict().parse(data);
 const projects=raw.projects.map(parseProject);
 if(new Set(projects.map(p=>p.id)).size!==projects.length||!projects.some(p=>p.id===raw.activeId))throw new Error('Lista de habitaciones inválida.');
 return {...raw,projects};
}
export function initialCollection(legacy:unknown):RoomCollection{const p=legacy===undefined?createProject():parseProject(legacy);return {version:1,activeId:p.id,projects:[p]};}
export function namedProject(p:Project,name:string):Project{return projectSchema.parse({...p,name:name.trim(),updatedAt:new Date().toISOString()});}
export function duplicateRoom(p:Project,name:string):Project{
 // Child IDs are scoped to a project; retaining them preserves all group references.
 return namedProject({...structuredClone(p),id:newId(),room:{...structuredClone(p.room),id:newId()},createdAt:new Date().toISOString()},name);
}
export function addRoom(c:RoomCollection,p:Project):RoomCollection{if(c.projects.some(r=>r.id===p.id))throw new Error('La habitación ya existe.');return parseCollection({...c,activeId:p.id,projects:[...c.projects,p]});}
export function removeRoom(c:RoomCollection,id:string):RoomCollection{if(c.projects.length===1)throw new Error('Conserva al menos una habitación.');const projects=c.projects.filter(p=>p.id!==id);return parseCollection({...c,projects,activeId:c.activeId===id?projects[0].id:c.activeId});}
