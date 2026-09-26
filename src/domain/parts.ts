import {z} from 'zod';
const fraction=z.number().finite().min(.0001).max(1);
export const partSchema=z.object({
 id:z.string().uuid(),name:z.string().trim().min(1).max(80),shape:z.enum(['box','cylinder','ellipsoid']),
 // Relative to measured parent: XY centre, Z base. Parent resizing is proportional.
 x:z.number().finite().min(-.5).max(.5),y:z.number().finite().min(-.5).max(.5),z:z.number().finite().min(0).max(1),
 width:fraction,depth:fraction,height:fraction,rotationDeg:z.number().finite().min(0).max(360),
}).strict();
export const compoundSchema=z.object({kind:z.literal('compound'),source:z.literal('manual-approximation'),parts:z.array(partSchema).min(1).max(32)}).strict().superRefine((v,ctx)=>{
 if(new Set(v.parts.map(p=>p.id)).size!==v.parts.length)ctx.addIssue({code:'custom',message:'IDs de piezas duplicados.'});
 for(const p of v.parts)if(p.z+p.height>1+1e-8)ctx.addIssue({code:'custom',message:`${p.name}: supera el alto del objeto.`});
});
export type Part=z.infer<typeof partSchema>;
