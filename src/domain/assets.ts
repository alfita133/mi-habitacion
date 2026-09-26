import {z} from 'zod';
export const MAX_ASSET_BYTES=32_000_000,MAX_PROJECT_ASSET_BYTES=128_000_000;
export const assetSchema=z.object({
 id:z.string().uuid(),fileName:z.string().trim().min(1).max(200),
 mimeType:z.string().min(1).max(100),byteLength:z.number().int().min(1).max(MAX_ASSET_BYTES),
 sha256:z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export const assetsSchema=z.array(assetSchema).max(128).superRefine((assets,ctx)=>{
 if(new Set(assets.map(a=>a.id)).size!==assets.length)ctx.addIssue({code:'custom',message:'Referencias de archivo duplicadas.'});
 if(assets.reduce((n,a)=>n+a.byteLength,0)>MAX_PROJECT_ASSET_BYTES)ctx.addIssue({code:'custom',message:'Los archivos de la habitación superan 128 MB.'});
 const sizes=new Map<string,number>();for(const a of assets){if(sizes.has(a.sha256)&&sizes.get(a.sha256)!==a.byteLength)ctx.addIssue({code:'custom',message:'Tamaños incompatibles para el mismo archivo.'});sizes.set(a.sha256,a.byteLength);}
});
export type AssetReference=z.infer<typeof assetSchema>;
