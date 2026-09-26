import {projectSchema,newId,valueCm,type Project} from '../domain/model.ts';
import {measured,type WallId} from '../domain/openings.ts';
import {familySchema,manifestSchema,bindingIssues,type RevitFamily,type RevitBinding} from './schema.ts';
export function importManifest(p:Project,data:unknown):Project{
 const manifest=manifestSchema.parse(data);let families=[...p.families];
 for(const f of manifest.families){if(f.status!=='processed')throw new Error('El manifiesto debe contener familias procesadas por Revit.');families=families.filter(old=>old.id!==f.id&&!(old.status==='pending'&&f.originalBase64&&old.originalBase64===f.originalBase64));families.push(f);}
 return projectSchema.parse({...p,families,updatedAt:new Date().toISOString()});
}
export function addPending(p:Project,fileName:string,originalBase64:string):Project{
 if(p.families.some(f=>f.originalBase64===originalBase64))return p;
 const f=familySchema.parse({id:newId(),name:fileName.replace(/\.rfa$/i,''),category:'decoración',revitCategory:'Sin procesar',fileName,sourcePath:fileName,status:'pending',revitVersion:'',placement:'unsupported',unit:'cm',originalBase64,thumbnail:null,types:[],notes:['Original guardado. Necesita el complemento Revit para extraer tipos y medidas.']});
 return projectSchema.parse({...p,families:[...p.families,f],updatedAt:new Date().toISOString()});
}
export type Placement={width:number;depth:number;height:number;x:number;y:number;z:number;wallId:WallId;offset:number};
export function addFamily(p:Project,familyId:string,typeId:string,d:Placement,parameters:RevitBinding['parameters']){
 const f=p.families.find(f=>f.id===familyId),t=f?.types.find(t=>t.id===typeId);if(!f||!t||f.status!=='processed')throw new Error('Procesa la familia en Revit antes de añadirla.');
 const revit={familyId,typeId,parameters},issues=bindingIssues(p.families,revit);if(issues.length)throw new Error(issues[0]);
 const id=newId(),name=`${f.name} · ${t.name}`.slice(0,80);
 if(f.category==='puertas'||f.category==='ventanas'){
  const o={id,name,kind:f.category==='puertas'?'door' as const:'window' as const,wallId:d.wallId,width:measured(d.width),height:measured(d.height),offset:measured(d.offset),sill:measured(f.category==='puertas'?0:d.z),revit};
  return {project:projectSchema.parse({...p,room:{...p.room,fixedElements:[...p.room.fixedElements,o]},updatedAt:new Date().toISOString()}),id,structural:true};
 }
 const object={id,name,category:f.category,position:{x:d.x,y:d.y,z:d.z},rotationDeg:0,dimensions:{width:measured(d.width),depth:measured(d.depth),height:measured(d.height)},initialHeightCm:d.height,model:{kind:'box' as const,source:'manual-approximation' as const},material:{color:'#627ba8',textureId:null},photoIds:[],hidden:false,groupId:null,revit};
 return {project:projectSchema.parse({...p,objects:[...p.objects,object],updatedAt:new Date().toISOString()}),id,structural:false};
}
export function editBinding(p:Project,id:string,revit:RevitBinding):Project{return projectSchema.parse({...p,objects:p.objects.map(o=>o.id===id?{...o,revit}:o),room:{...p.room,fixedElements:p.room.fixedElements.map(o=>o.id===id?{...o,revit}:o)},updatedAt:new Date().toISOString()});}
export function effectiveParameters(f:RevitFamily,b:RevitBinding,d:{width:number;depth:number;height:number}){
 const t=f.types.find(t=>t.id===b.typeId)!;const parameters={...b.parameters};for(const axis of ['width','depth','height'] as const){const key=t.dimensionParameters[axis];if(key)parameters[key]=d[axis];}return parameters;
}
export function toRevitPosition(p:{x:number;y:number;z:number}){return {x:p.x/30.48,y:-p.y/30.48,z:p.z/30.48};}
export function suggestions(p:Project,text:string){const query=text.toLocaleLowerCase('es');const wanted=new Set<string>();
 if(/habitaci[oó]n|dormir|dormitorio/.test(query))for(const c of ['camas','armarios','iluminación'])wanted.add(c);
 if(/estudi|trabaj|oficina|escritorio/.test(query))for(const c of ['escritorios','sillas','iluminación','estanterías'])wanted.add(c);
 if(/leer|lectura/.test(query))for(const c of ['sillas','estanterías','iluminación'])wanted.add(c);
 for(const f of p.families)if(query.includes(f.category))wanted.add(f.category);
 const present=new Set([...p.objects.map(o=>p.families.find(f=>f.id===o.revit?.familyId)?.category??o.category.toLowerCase()),...p.room.fixedElements.map(o=>o.kind==='door'?'puertas':'ventanas')]);
 return [...wanted].filter(c=>!present.has(c)).map(category=>({category,families:p.families.filter(f=>f.category===category&&f.status==='processed'),reason:'No hay una instancia de esta categoría en la habitación.'}));
}
export function exportRevit(p:Project){return {format:'habitacion.revit-project',version:1,coordinateSystem:'cm-x-right-y-down-z-up-centerXY-baseZ',project:projectSchema.parse(p),roomDimensionsCm:{width:valueCm(p.room.dimensions.width),depth:valueCm(p.room.dimensions.depth),height:valueCm(p.room.dimensions.height)}};}
