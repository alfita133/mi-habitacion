import {maxDoorAngle} from '../geometry/door-leaf.ts';
import {outlineIssues,roomWalls} from '../geometry/outline.ts';
import {assetsSchema} from './assets.ts';
import {fixedVolumeSchema} from './fixed-volumes.ts';
import { z } from 'zod';
import {familySchema,bindingSchema,bindingIssues} from '../revit/schema.ts';
import { objectSchema,objectV6Schema,objectV5Schema,objectV4Schema,objectV3Schema,type MovableObject } from './objects.ts';
import { objectIssues } from '../collisions/objects.ts';
import { openingSchema, openingV7Schema, openingIssues, type Opening } from './openings.ts';

export const DIMENSION_KEYS = ['width', 'depth', 'height'] as const;
export type DimensionKey = typeof DIMENSION_KEYS[number];
const measurement = (max: number) => z.object({
  defaultCm: z.number().finite().min(50).max(max),
  estimatedCm: z.number().finite().min(50).max(max).nullable(),
  manualCm: z.number().finite().min(50).max(max).nullable(),
}).strict();
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const projectV1Schema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().uuid(), name: z.string().trim().min(1).max(100),
  unit: z.literal('cm'), createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
  room: z.object({
    id: z.string().uuid(), shape: z.literal('rectangle'),
    dimensions: z.object({width: measurement(2000), depth: measurement(2000), height: measurement(1000)}).strict(),
    wallThicknessCm: z.number().finite().min(1).max(100),
    wallColor: color, floorColor: color,
    fixedElements: z.array(z.never()).max(0),
  }).strict(),
  objects: z.array(z.never()).max(0), photos: z.array(z.never()).max(0), models: z.array(z.never()).max(0),
}).strict();
const v2Base = projectV1Schema.extend({
  schemaVersion:z.literal(2),
  room:projectV1Schema.shape.room.extend({fixedElements:z.array(openingSchema).max(64)}),
});
export const projectV2Schema=v2Base.superRefine((project,ctx)=>{
  const dims=project.room.dimensions;
  const value=(m:{manualCm:number|null;estimatedCm:number|null;defaultCm:number})=>m.manualCm??m.estimatedCm??m.defaultCm;
  for(const message of openingIssues(project.room.fixedElements,value(dims.width),value(dims.depth),value(dims.height)))ctx.addIssue({code:z.ZodIssueCode.custom,message,path:['room','fixedElements']});
});
export const projectV3Schema=v2Base.extend({schemaVersion:z.literal(3),objects:z.array(objectV3Schema).max(100)}).superRefine((project,ctx)=>{
 const dims=project.room.dimensions;
 const cm=(m:{manualCm:number|null;estimatedCm:number|null;defaultCm:number})=>m.manualCm??m.estimatedCm??m.defaultCm;
 for(const message of [...openingIssues(project.room.fixedElements,cm(dims.width),cm(dims.depth),cm(dims.height)),...objectIssues(project.room,project.objects.map(o=>({...o,hidden:false,groupId:null,initialHeightCm:cm(o.dimensions.height)})))])ctx.addIssue({code:z.ZodIssueCode.custom,message});
});
const v4Base=v2Base.extend({schemaVersion:z.literal(4),objects:z.array(objectV4Schema).max(100),groups:z.array(z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(80)}).strict()).max(50)});
const validateGroups=(p:z.infer<typeof v4Base>,ctx:z.RefinementCtx)=>{
 const value=(m:{manualCm:number|null;estimatedCm:number|null;defaultCm:number})=>m.manualCm??m.estimatedCm??m.defaultCm,d=p.room.dimensions;
 const issues=openingIssues(p.room.fixedElements,value(d.width),value(d.depth),value(d.height));
 if(new Set(p.objects.map(o=>o.id)).size!==p.objects.length)issues.push('ID de objeto duplicado.');
 if(new Set(p.groups.map(g=>g.id)).size!==p.groups.length)issues.push('ID de grupo duplicado.');
 for(const o of p.objects)if(o.groupId&&!p.groups.some(g=>g.id===o.groupId))issues.push('Grupo inexistente.');
 for(const g of p.groups)if(p.objects.filter(o=>o.groupId===g.id).length<2)issues.push('Un grupo necesita al menos dos piezas.');
 for(const message of issues)ctx.addIssue({code:z.ZodIssueCode.custom,message});
};
export const projectV4Schema=v4Base.superRefine(validateGroups);
const v5Base=v4Base.extend({schemaVersion:z.literal(5),objects:z.array(objectV5Schema).max(100)});
export const projectV5Schema=v5Base.superRefine((p,ctx)=>validateGroups({...p,schemaVersion:4},ctx));
const v6Base=v5Base.extend({schemaVersion:z.literal(6),objects:z.array(objectV6Schema).max(100),families:z.array(familySchema).max(40),room:v2Base.shape.room.extend({fixedElements:z.array(openingSchema.extend({revit:bindingSchema.optional()})).max(64)})});
const validateRevit=(p:z.infer<typeof v6Base>,ctx:z.RefinementCtx)=>{
 validateGroups({...p,schemaVersion:4},ctx);
 if(new Set(p.families.map(f=>f.id)).size!==p.families.length)ctx.addIssue({code:'custom',message:'Familias duplicadas.'});
 if(p.families.reduce((n,f)=>n+(f.originalBase64?.length??0)+(f.thumbnail?.length??0),0)>30_000_000)ctx.addIssue({code:'custom',message:'La biblioteca supera 30 MB. Divide las familias entre habitaciones.'});
 for(const o of [...p.objects,...p.room.fixedElements])for(const message of bindingIssues(p.families,o.revit))ctx.addIssue({code:'custom',message});
};
export const projectV6Schema=v6Base.superRefine(validateRevit);
const v7Base=v6Base.extend({schemaVersion:z.literal(7),room:v6Base.shape.room.extend({fixedElements:z.array(openingV7Schema.extend({revit:bindingSchema.optional()})).max(64)})});
export const projectV7Schema=v7Base.superRefine((p,ctx)=>validateRevit({...p,schemaVersion:6},ctx));
const v8Base=v7Base.extend({schemaVersion:z.literal(8),room:v7Base.shape.room.extend({fixedVolumes:z.array(fixedVolumeSchema).max(64)})});
const validateV8=(p:z.infer<typeof v8Base>,ctx:z.RefinementCtx)=>{
 validateRevit({...p,schemaVersion:6},ctx);
 const ids=[...p.objects,...p.room.fixedElements,...p.room.fixedVolumes].map(o=>o.id);
 if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'Los IDs de muebles, huecos y elementos fijos deben ser únicos.'});
};
export const projectV8Schema=v8Base.superRefine(validateV8);
const v9Base=v8Base.extend({schemaVersion:z.literal(9),assets:assetsSchema});
export const projectV9Schema=v9Base.superRefine((p,ctx)=>validateV8({...p,schemaVersion:8},ctx));
const v10Base=v9Base.extend({schemaVersion:z.literal(10),objects:z.array(objectSchema).max(100)});
const validateV10=(p:z.infer<typeof v10Base>,ctx:z.RefinementCtx)=>{
 // Historical validators only inspect identity, groups, openings and bindings.
 validateV8({...p,schemaVersion:8,objects:p.objects.map(o=>({...o,model:{kind:'box',source:'manual-approximation'}}))},ctx);
 for(const o of p.objects)if(o.model.kind==='compound')for(const part of o.model.parts){
  const w=valueCm(o.dimensions.width),d=valueCm(o.dimensions.depth),a=part.rotationDeg*Math.PI/180;
  const ex=part.shape==='box'?(Math.abs(Math.cos(a))*part.width*w+Math.abs(Math.sin(a))*part.depth*d)/2:Math.hypot(Math.cos(a)*part.width*w,Math.sin(a)*part.depth*d)/2;
  const ey=part.shape==='box'?(Math.abs(Math.sin(a))*part.width*w+Math.abs(Math.cos(a))*part.depth*d)/2:Math.hypot(Math.sin(a)*part.width*w,Math.cos(a)*part.depth*d)/2;
  if(Math.abs(part.x*w)+ex>w/2+1e-6||Math.abs(part.y*d)+ey>d/2+1e-6)ctx.addIssue({code:'custom',message:`${part.name}: debe quedar dentro del ancho y fondo medidos del objeto.`});
 }
};
export const projectV10Schema=v10Base.superRefine(validateV10);
const vertexSchema=z.object({id:z.string().uuid(),x:z.number().finite().min(0).max(2000),y:z.number().finite().min(0).max(2000)}).strict();
export const projectSchema=v10Base.extend({schemaVersion:z.literal(11),room:v10Base.shape.room.extend({shape:z.enum(['rectangle','polygon']),vertices:z.array(vertexSchema).min(3).max(32).optional(),fixedElements:z.array(openingV7Schema.extend({wallId:z.string().min(1),revit:bindingSchema.optional()})).max(64)})}).superRefine((p,ctx)=>{
 // Reuse legacy identity, asset, part and binding checks with structural validation below.
 validateV10({...p,schemaVersion:10,room:{...p.room,shape:'rectangle',fixedElements:[]}},ctx);
 const add=(message:string)=>ctx.addIssue({code:'custom',message});
 const ids=[...p.objects,...p.room.fixedElements,...p.room.fixedVolumes].map(o=>o.id);if(new Set(ids).size!==ids.length)add('Los IDs de elementos deben ser únicos.');
 if(p.room.shape==='polygon'){
 const v=p.room.vertices;if(!v){add('Falta el contorno.');return;}
 for(const issue of outlineIssues(v))add(issue);
 if(new Set(v.map(v=>v.id)).size!==v.length)add('Esquinas duplicadas.');
 if(Math.min(...v.map(v=>v.x))!==0||Math.min(...v.map(v=>v.y))!==0||Math.abs(Math.max(...v.map(v=>v.x))-valueCm(p.room.dimensions.width))>1e-6||Math.abs(Math.max(...v.map(v=>v.y))-valueCm(p.room.dimensions.depth))>1e-6)add('Las medidas exteriores deben coincidir con el contorno.');
 }else if(p.room.vertices)add('Un rectángulo no admite un contorno adicional.');
 for(const o of p.room.fixedElements){
 const wall=roomWalls(p.room).find(w=>w.id===o.wallId);if(!wall){add(`${o.name}: pared no encontrada.`);continue;}
 for(const message of openingIssues(p.room.fixedElements.filter(v=>v.wallId===o.wallId),wall.length,wall.length,valueCm(p.room.dimensions.height)))add(message);
 for(const message of bindingIssues(p.families,o.revit))add(message);
 }
}).transform(p=>{for(const o of p.room.fixedElements)if(o.swing)o.swing.angleDeg=Math.min(o.swing.angleDeg,maxDoorAngle(o,p.room));return p;});

export function upsertObject(project:Project,object:MovableObject):Project {
 const objects=project.objects.some(o=>o.id===object.id)?project.objects.map(o=>o.id===object.id?object:o):[...project.objects,object];
 return projectSchema.parse({...project,objects,updatedAt:new Date().toISOString()});
}
export function moveObject(project:Project,id:string,x:number,y:number):Project {
 const previous=project.objects.find(o=>o.id===id);if(!previous)throw new Error('Objeto no encontrado.');
 const next={...previous,position:{...previous.position,x,y}};
 return upsertObject(project,next);
}
export function removeObject(project:Project,id:string):Project {return projectSchema.parse({...project,objects:project.objects.filter(o=>o.id!==id),updatedAt:new Date().toISOString()});}
export function parseProject(data:unknown):Project {
 const version=typeof data==='object'&&data!==null&&'schemaVersion' in data?data.schemaVersion:undefined;
 if(version===11)return projectSchema.parse(data);
 if(version===10)return projectSchema.parse({...projectV10Schema.parse(data),schemaVersion:11});
 if(version===9)return projectSchema.parse({...projectV9Schema.parse(data),schemaVersion:11});
 if(version===8)return projectSchema.parse({...projectV8Schema.parse(data),schemaVersion:11,assets:[]});
 let previous:z.infer<typeof projectV7Schema>;
 if(version===7)previous=projectV7Schema.parse(data);
 else if(version===6)previous={...projectV6Schema.parse(data),schemaVersion:7};
 else if(version===5)previous={...projectV5Schema.parse(data),schemaVersion:7,families:[]};
 else if(version===4){const old=projectV4Schema.parse(data);previous={...old,schemaVersion:7,families:[],objects:old.objects.map(o=>({...o,initialHeightCm:valueCm(o.dimensions.height)}))};}
 else if(version===1||version===2||version===3){const old=version===1?projectV1Schema.parse(data):version===2?projectV2Schema.parse(data):projectV3Schema.parse(data);previous={...old,schemaVersion:7,families:[],groups:[],objects:old.objects.map(o=>({...o,hidden:false,groupId:null,initialHeightCm:valueCm(o.dimensions.height)}))};}
 else return projectSchema.parse(data);
 return projectSchema.parse({...previous,schemaVersion:11,assets:[],room:{...previous.room,fixedVolumes:[]}});
}
export function upsertOpening(project:Project,opening:Opening):Project {
  if(opening.swing&&Number.isFinite(opening.swing.angleDeg)&&opening.swing.angleDeg>=0&&opening.swing.angleDeg<=180)opening={...opening,swing:{...opening.swing,angleDeg:Math.min(opening.swing.angleDeg,maxDoorAngle(opening,project.room))}};
  const next=structuredClone(project),index=next.room.fixedElements.findIndex(o=>o.id===opening.id);
  if(index<0)next.room.fixedElements.push(opening);else next.room.fixedElements[index]=opening;
  next.updatedAt=new Date().toISOString();return projectSchema.parse(next);
}
export function removeOpening(project:Project,id:string):Project {
  const next=structuredClone(project);next.room.fixedElements=next.room.fixedElements.filter(o=>o.id!==id);
  next.updatedAt=new Date().toISOString();return projectSchema.parse(next);
}
export function validationMessage(error:unknown):string {
  if(error instanceof z.ZodError)return error.issues.find(i=>i.code==='custom')?.message??'Revisa los valores y los límites de las medidas.';
  return error instanceof Error?error.message:'No se pudo aplicar el cambio.';
}
export type Project = z.infer<typeof projectSchema>;
export type Room = Project['room'];
export type Measurement = Room['dimensions']['width'];
export const valueCm = (m: Measurement): number => m.manualCm ?? m.estimatedCm ?? m.defaultCm;
export const sourceLabel = (m: Measurement): string => m.manualCm !== null ? 'Real' : m.estimatedCm !== null ? 'Estimada' : 'Ejemplo';
export const effectiveDimensions = (room: Room) => ({
  width: valueCm(room.dimensions.width), depth: valueCm(room.dimensions.depth), height: valueCm(room.dimensions.height),
});
// getRandomValues is available on the HTTP development preview as well as HTTPS.
// randomUUID alone would fail on the preview's non-secure origin.
export function newId(): string {
  const bytes=crypto.getRandomValues(new Uint8Array(16));
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export function createProject(): Project {
  const date = new Date().toISOString();
  const example = (n: number): Measurement => ({defaultCm:n, estimatedCm:null, manualCm:null});
  return {schemaVersion:11,assets:[],families:[],groups:[],id:newId(),name:'Mi habitación',unit:'cm',createdAt:date,updatedAt:date,
    room:{id:newId(),shape:'rectangle',dimensions:{width:example(400),depth:example(350),height:example(260)},wallThicknessCm:12,wallColor:'#e3e9f1',floorColor:'#b7c5d5',fixedElements:[],fixedVolumes:[]},objects:[],photos:[],models:[]};
}
export function setManualDimensions(project: Project, values: Record<DimensionKey, number | null>): Project {
  const next = structuredClone(project);
  for (const key of DIMENSION_KEYS) next.room.dimensions[key].manualCm = values[key];
  if(next.room.shape==='polygon'&&next.room.vertices){const sx=valueCm(next.room.dimensions.width)/valueCm(project.room.dimensions.width),sy=valueCm(next.room.dimensions.depth)/valueCm(project.room.dimensions.depth);next.room.vertices=next.room.vertices.map(v=>({...v,x:v.x*sx,y:v.y*sy}));}
  next.updatedAt = new Date().toISOString();
  return projectSchema.parse(next);
}
// Future vision adapters may update estimates, but cannot change manual measurements.
export function setEstimatedDimension(project: Project, key: DimensionKey, estimate: number): Project {
  const next = structuredClone(project);
  next.room.dimensions[key].estimatedCm = estimate;
  next.updatedAt = new Date().toISOString();
  return projectSchema.parse(next);
}
