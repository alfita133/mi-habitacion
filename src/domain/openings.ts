import { z } from 'zod';
import {doorSwingSchema,type DoorSwing} from './door-swing.ts';
import type {RevitBinding} from '../revit/schema.ts';
export const WALL_IDS = ['north','east','south','west'] as const;
export type WallId = string;
export const wallLabels:Record<WallId,string>={north:'A · Arriba',east:'B · Derecha',south:'C · Abajo',west:'D · Izquierda'};
const measure=(min:number,max:number)=>z.object({defaultCm:z.number().finite().min(min).max(max),estimatedCm:z.number().finite().min(min).max(max).nullable(),manualCm:z.number().finite().min(min).max(max).nullable()}).strict();
export const openingSchema=z.object({
  id:z.string().uuid(),kind:z.enum(['door','window']),name:z.string().trim().min(1).max(80),wallId:z.enum(WALL_IDS),
  width:measure(1,2000),height:measure(1,1000),offset:measure(0,2000),sill:measure(0,1000),
}).strict();
export const openingV7Schema=openingSchema.extend({swing:doorSwingSchema.optional()});
export type Opening=Omit<z.infer<typeof openingSchema>,'wallId'>&{wallId:WallId}&{revit?:RevitBinding;swing?:DoorSwing};
export const measured=(n:number)=>({defaultCm:n,estimatedCm:null,manualCm:n});
export function openingBounds(o:Opening){
  const v=(m:Opening['width'])=>m.manualCm??m.estimatedCm??m.defaultCm;
  return {start:v(o.offset),end:v(o.offset)+v(o.width),bottom:v(o.sill),top:v(o.sill)+v(o.height),width:v(o.width),height:v(o.height)};
}
export function openingIssues(openings:Opening[],width:number,depth:number,height:number):string[]{
  const issues:string[]=[],ids=new Set<string>();
  for(let i=0;i<openings.length;i++){
    const o=openings[i],b=openingBounds(o),length=o.wallId==='north'||o.wallId==='south'?width:depth;
    if(o.kind==='window'&&o.swing)issues.push('Las ventanas no admiten hoja de puerta.');
    if(ids.has(o.id))issues.push('Hay elementos estructurales con el mismo ID.');ids.add(o.id);
    if(b.end>length||b.top>height)issues.push(`${o.name}: el hueco no cabe en la pared. Revisa ancho, alto y posición.`);
    if(o.kind==='door'&&b.bottom!==0)issues.push(`${o.name}: la puerta debe empezar en el suelo.`);
    for(let j=0;j<i;j++){
      const other=openings[j],a=openingBounds(other);
      if(other.wallId===o.wallId&&b.start<a.end&&b.end>a.start&&b.bottom<a.top&&b.top>a.bottom)issues.push(`${o.name} se solapa con ${other.name}.`);
    }
  }
  return issues;
}
