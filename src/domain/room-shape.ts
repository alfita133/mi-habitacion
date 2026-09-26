import {newId,projectSchema,valueCm,type Project} from './model.ts';
import {measured} from './openings.ts';
import {roomWalls,type Vertex} from '../geometry/outline.ts';
export function setRoomOutline(project:Project,vertices:Vertex[],wallMapping:Record<string,string>={}):Project{
 const v=vertices.map(p=>({...p}));
 // Keep the origin at the upper-left of the footprint, without relocating furniture.
 const minX=Math.min(...v.map(p=>p.x)),minY=Math.min(...v.map(p=>p.y));
 for(const p of v){p.x-=minX;p.y-=minY;}
 const room={...project.room,shape:'polygon' as const,vertices:v,dimensions:{...project.room.dimensions,width:measured(Math.max(...v.map(p=>p.x))),depth:measured(Math.max(...v.map(p=>p.y)))},fixedElements:project.room.fixedElements.map(o=>({...o,wallId:wallMapping[o.id]??o.wallId}))};
 return projectSchema.parse({...project,room,updatedAt:new Date().toISOString()});
}
export function initialVertices(project:Project):Vertex[]{return project.room.vertices?.map(v=>({...v}))??[{x:0,y:0},{x:valueCm(project.room.dimensions.width),y:0},{x:valueCm(project.room.dimensions.width),y:valueCm(project.room.dimensions.depth)},{x:0,y:valueCm(project.room.dimensions.depth)}].map(p=>({...p,id:newId()}));}
export function suggestedWallMapping(project:Project,vertices:Vertex[]){
 const walls=roomWalls({...project.room,shape:'polygon',vertices}),old=roomWalls(project.room),mapping:Record<string,string>={};
 for(const o of project.room.fixedElements){if(walls.some(w=>w.id===o.wallId)){mapping[o.id]=o.wallId;continue;}const a=old.find(w=>w.id===o.wallId)!;const x=(a.start.x+a.end.x)/2,y=(a.start.y+a.end.y)/2;mapping[o.id]=[...walls].sort((a,b)=>Math.hypot((a.start.x+a.end.x)/2-x,(a.start.y+a.end.y)/2-y)-Math.hypot((b.start.x+b.end.x)/2-x,(b.start.y+b.end.y)/2-y))[0]?.id??'';}
 return mapping;
}
