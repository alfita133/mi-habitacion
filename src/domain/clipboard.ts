import {members} from './groups.ts';
import {newId,projectSchema,type Project} from './model.ts';
export type ObjectClipboard={objects:Project['objects'];groupName:string|null};
export function copyEntity(p:Project,id:string):ObjectClipboard|null {const objects=members(p,id);return objects.length?structuredClone({objects,groupName:p.groups.find(g=>g.id===objects[0].groupId)?.name??null}):null;}
export function pasteEntity(p:Project,clip:ObjectClipboard,offset=10){const groupId=clip.groupName?newId():null,objects=clip.objects.map(o=>({...structuredClone(o),id:newId(),hidden:false,groupId,position:{...o.position,x:o.position.x+offset,y:o.position.y+offset}}));const project=projectSchema.parse({...p,objects:[...p.objects,...objects],groups:groupId?[...p.groups,{id:groupId,name:clip.groupName!}]:p.groups,updatedAt:new Date().toISOString()});return {project,selected:objects[0].id};}
