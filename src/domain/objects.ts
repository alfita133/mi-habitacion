import {compoundSchema} from './parts.ts';
import { z } from 'zod';
import {bindingSchema} from '../revit/schema.ts';
const measure=z.object({defaultCm:z.number().finite().min(1).max(2000),estimatedCm:z.number().finite().min(1).max(2000).nullable(),manualCm:z.number().finite().min(1).max(2000).nullable()}).strict();
export const objectV3Schema=z.object({
 id:z.string().uuid(),name:z.string().trim().min(1).max(80),category:z.string().trim().min(1).max(80),
 position:z.object({x:z.number().finite(),y:z.number().finite(),z:z.number().finite()}).strict(),rotationDeg:z.number().finite().min(0).max(360),
 dimensions:z.object({width:measure,depth:measure,height:measure}).strict(),
 model:z.object({kind:z.literal('box'),source:z.literal('manual-approximation')}).strict(),
 material:z.object({color:z.string().regex(/^#[0-9a-fA-F]{6}$/),textureId:z.null()}).strict(),photoIds:z.array(z.never()).max(0),
}).strict();
export const objectV4Schema=objectV3Schema.extend({hidden:z.boolean(),groupId:z.string().uuid().nullable()});
export const objectV5Schema=objectV4Schema.extend({initialHeightCm:z.number().finite().min(1).max(2000)});
export const objectV6Schema=objectV5Schema.extend({revit:bindingSchema.optional()});
export const objectSchema=objectV6Schema.extend({model:z.union([objectV3Schema.shape.model,compoundSchema])});
export type MovableObject=z.infer<typeof objectSchema>;
export const cm=(m:{manualCm:number|null;estimatedCm:number|null;defaultCm:number})=>m.manualCm??m.estimatedCm??m.defaultCm;
export type CollisionBody=Pick<MovableObject,'id'|'name'|'position'|'rotationDeg'|'dimensions'>;
export function footprint(o:CollisionBody){
 const a=o.rotationDeg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),w=cm(o.dimensions.width)/2,d=cm(o.dimensions.depth)/2;
 return [[-w,-d],[w,-d],[w,d],[-w,d]].map(([x,y])=>({x:o.position.x+x*c-y*s,y:o.position.y+x*s+y*c}));
}
