import {z} from 'zod';
export const doorSwingSchema=z.object({
 hinge:z.enum(['start','end']),direction:z.enum(['inward','outward']),
 angleDeg:z.number().finite().min(0).max(180),thicknessCm:z.number().finite().min(.5).max(20),
}).strict();
export type DoorSwing=z.infer<typeof doorSwingSchema>;
export const defaultDoorSwing=():DoorSwing=>({hinge:'start',direction:'inward',angleDeg:90,thicknessCm:4});
