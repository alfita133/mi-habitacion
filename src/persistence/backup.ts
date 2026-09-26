import {z} from 'zod';
import {parseProject,projectSchema,type Project} from '../domain/model.ts';
import {assetsSchema,MAX_PROJECT_ASSET_BYTES} from '../domain/assets.ts';
import {verifyAsset,type AssetBlob} from './assets.ts';
import {deserializeProject} from './serialization.ts';
const MAGIC='ROOMPK01',HEADER_BYTES=12,MAX_MANIFEST_BYTES=40_000_000;
export const MAX_BACKUP_BYTES=HEADER_BYTES+MAX_MANIFEST_BYTES+MAX_PROJECT_ASSET_BYTES;
const manifestSchema=z.object({format:z.literal('habitacion.backup'),version:z.literal(1),project:z.unknown(),files:assetsSchema}).strict();
export type PreparedBackup={project:Project;blobs:AssetBlob[]};
// Layout: magic(8), uint32LE manifest length(4), UTF8 manifest, raw blobs in manifest order.
// One copy per hash. No compression, external paths or executable interpretation.
export async function encodeBackup(value:Project,records:AssetBlob[]):Promise<Blob>{
 const project=projectSchema.parse(value),refs=[...new Map(project.assets.map(a=>[a.sha256,a])).values()],data=new Map(records.map(r=>[r.sha256,r.blob]));
 if(data.size!==records.length||data.size!==refs.length)throw new Error('Los archivos de la copia no corresponden a la habitación.');
 const parts:Blob[]=[];
 for(const ref of refs){const blob=data.get(ref.sha256);if(!blob)throw new Error(`Falta ${ref.fileName}.`);await verifyAsset(ref,blob);parts.push(blob);}
 const json=new TextEncoder().encode(JSON.stringify({format:'habitacion.backup',version:1,project,files:refs}));
 if(json.byteLength>MAX_MANIFEST_BYTES)throw new Error('El manifiesto supera 40 MB.');
 const header=new Uint8Array(HEADER_BYTES);header.set(new TextEncoder().encode(MAGIC));new DataView(header.buffer).setUint32(8,json.byteLength,true);
 return new Blob([header,json,...parts],{type:'application/octet-stream'});
}
export async function decodeBackup(file:Blob):Promise<PreparedBackup>{
 if(file.size>MAX_BACKUP_BYTES)throw new Error('La copia supera el límite de 168 MB.');
 const header=await file.slice(0,HEADER_BYTES).arrayBuffer();
 if(header.byteLength!==HEADER_BYTES||new TextDecoder().decode(header.slice(0,8))!==MAGIC)throw new Error('No es una copia completa compatible.');
 const size=new DataView(header).getUint32(8,true);
 if(size>MAX_MANIFEST_BYTES||size<1||HEADER_BYTES+size>file.size)throw new Error('Cabecera de copia dañada.');
 let raw:unknown;try{raw=JSON.parse(await file.slice(HEADER_BYTES,HEADER_BYTES+size).text());}catch{throw new Error('Manifiesto de copia inválido.');}
 const manifest=manifestSchema.parse(raw),project=parseProject(manifest.project);
 const refs=new Map(project.assets.map(a=>[a.sha256,a]));
 if(refs.size!==manifest.files.length||new Set(manifest.files.map(a=>a.sha256)).size!==manifest.files.length)throw new Error('Lista de archivos de copia incoherente.');
 let offset=HEADER_BYTES+size;const blobs:AssetBlob[]=[];
 for(const fileRef of manifest.files){
 const ref=refs.get(fileRef.sha256);
 if(!ref||ref.byteLength!==fileRef.byteLength)throw new Error('Archivo ajeno al manifiesto de habitación.');
 const blob=file.slice(offset,offset+ref.byteLength,ref.mimeType);await verifyAsset(ref,blob);blobs.push({sha256:ref.sha256,blob});offset+=ref.byteLength;
 }
 if(offset!==file.size)throw new Error('La copia contiene bytes sobrantes o está incompleta.');
 return {project,blobs};
}
export async function readBackupFile(file:Blob):Promise<PreparedBackup>{
 if(new TextDecoder().decode(await file.slice(0,8).arrayBuffer())===MAGIC)return decodeBackup(file);
 if(file.size>MAX_MANIFEST_BYTES)throw new Error('El JSON supera 40 MB.');
 const project=deserializeProject(await file.text());
 if(project.assets.length)throw new Error('Este JSON referencia archivos externos. Abre la copia completa .habitacion.pack para conservarlos.');
 return {project,blobs:[]};
}
