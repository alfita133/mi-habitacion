import {newId,upsertObject,upsertOpening,valueCm,type Project} from './model.ts';
import {upsertFixedVolume} from './fixed-volume-operations.ts';
import {templateParts,type Template} from './templates.ts';
import {measured} from './openings.ts';
import {roomWalls} from '../geometry/outline.ts';
export const presets=[
 {key:'desk',name:'Escritorio',kind:'movable',size:[120,60,75]},
 {key:'bed',name:'Cama',kind:'movable',size:[100,200,80]},
 {key:'chair',name:'Silla',kind:'movable',size:[45,50,90]},
 {key:'wardrobe',name:'Armario',kind:'movable',size:[100,60,200]},
 {key:'shelf',name:'Estantería',kind:'movable',size:[80,30,180]},
 {key:'fan',name:'Ventilador',kind:'movable',size:[40,40,120]},
 {key:'table',name:'Mesa',kind:'movable',size:[100,70,75]},
 {key:'custom',name:'Caja a medida',kind:'movable',size:[50,50,50]},
 {key:'door',name:'Puerta',kind:'opening',size:[80,4,200]},
 {key:'window',name:'Ventana',kind:'opening',size:[100,12,100]},
 {key:'pillar',name:'Pilar',kind:'fixed',size:[30,30,260]},
 {key:'radiator',name:'Radiador',kind:'fixed',size:[80,15,60]},
] as const;
export type PresetKey=typeof presets[number]['key'];
const example=(n:number)=>({defaultCm:n,estimatedCm:null,manualCm:null});
export function addPreset(project:Project,key:string,x:number,y:number){
 const preset=presets.find(p=>p.key===key);if(!preset)throw new Error('Elemento no reconocido.');
 const id=newId(),[w,d,h]=preset.size,dimensions={width:example(w),depth:example(d),height:example(preset.key==='pillar'?valueCm(project.room.dimensions.height):h)};
 if(preset.kind==='opening'){
 const wall=roomWalls(project.room).map(w=>{const along=Math.max(0,Math.min(w.length,(x-w.start.x)*w.tangent.x+(y-w.start.y)*w.tangent.y));return {wall:w,along,distance:Math.hypot(x-w.start.x-along*w.tangent.x,y-w.start.y-along*w.tangent.y)};}).sort((a,b)=>a.distance-b.distance)[0];
 const offset=Math.max(0,Math.min(wall.wall.length-w,wall.along-w/2));
 return {project:upsertOpening(project,{id,kind:preset.key as 'door'|'window',name:preset.name,wallId:wall.wall.id,width:example(w),height:example(h),offset:measured(offset),sill:example(preset.key==='door'?0:90),...(preset.key==='door'?{swing:{hinge:'start' as const,direction:'inward' as const,angleDeg:90,thicknessCm:4}}:{})}),id,kind:preset.kind};
 }
 if(preset.kind==='fixed')return {project:upsertFixedVolume(project,{id,name:preset.name,color:'#63758a',position:{x,y,z:preset.key==='radiator'?15:0},rotationDeg:0,dimensions}),id,kind:preset.kind};
 return {project:upsertObject(project,{id,name:preset.name,category:preset.name,position:{x,y,z:0},rotationDeg:0,dimensions,initialHeightCm:h,hidden:false,groupId:null,model:{kind:'compound',source:'manual-approximation',parts:templateParts(key as Template)},material:{color:'#537395',textureId:null},photoIds:[]}),id,kind:preset.kind};
}
