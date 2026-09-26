import {z} from 'zod';
import {objectV3Schema} from './objects.ts';
export const fixedVolumeSchema=z.object({
 id:z.string().uuid(),name:z.string().trim().min(1).max(80),
 position:objectV3Schema.shape.position,rotationDeg:objectV3Schema.shape.rotationDeg,
 dimensions:objectV3Schema.shape.dimensions,color:z.string().regex(/^#[0-9a-fA-F]{6}$/),
}).strict();
export type FixedVolume=z.infer<typeof fixedVolumeSchema>;
