import {sha256} from '@noble/hashes/sha2.js';
import {bytesToHex} from '@noble/hashes/utils.js';
import {assetSchema,MAX_ASSET_BYTES,type AssetReference} from '../domain/assets.ts';
export type AssetBlob={sha256:string;blob:Blob};
// Incremental hashing also works on the HTTP preview without SubtleCrypto.
export async function hashBlob(blob:Blob):Promise<string>{
 const hash=sha256.create(),chunkSize=1_048_576;
 for(let offset=0;offset<blob.size;offset+=chunkSize){hash.update(new Uint8Array(await blob.slice(offset,offset+chunkSize).arrayBuffer()));}
 return bytesToHex(hash.digest());
}
export async function verifyAsset(reference:AssetReference,blob:Blob):Promise<void>{
 const a=assetSchema.parse(reference);
 if(!(blob instanceof Blob)||blob.size!==a.byteLength||blob.size>MAX_ASSET_BYTES)throw new Error(`Archivo incompleto: ${a.fileName}.`);
 if(await hashBlob(blob)!==a.sha256)throw new Error(`Archivo dañado: ${a.fileName}.`);
}
