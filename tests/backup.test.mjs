import test from 'node:test';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createProject,newId,parseProject} from '../src/domain/model.ts';
import {assetSchema} from '../src/domain/assets.ts';
import {hashBlob} from '../src/persistence/assets.ts';
import {encodeBackup,decodeBackup,readBackupFile} from '../src/persistence/backup.ts';
import {addPending} from '../src/revit/operations.ts';
async function sample(){const blob=new Blob([new Uint8Array([0,255,1,2,3,4])]);const ref=assetSchema.parse({id:newId(),fileName:'fixture.bin',mimeType:'application/octet-stream',byteLength:blob.size,sha256:await hashBlob(blob)});const p=addPending(createProject(),'fixture.rfa',Buffer.from([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1,1]).toString('base64'));p.assets=[ref];return {p,blob,ref,records:[{sha256:ref.sha256,blob}]};}
test('binary complete backup preserves exact bytes, reference IDs, room and RFA originals',async()=>{
 const {p,blob,ref,records}=await sample();p.assets.push({...ref,id:newId(),fileName:'alias.bin'});const pack=await encodeBackup(p,records),restored=await decodeBackup(pack);
 assert.deepEqual(restored.project,p);assert.equal(restored.blobs.length,1);assert.deepEqual(await restored.blobs[0].blob.arrayBuffer(),await blob.arrayBuffer());assert.equal(await hashBlob(blob),createHash('sha256').update(new Uint8Array(await blob.arrayBuffer())).digest('hex'));
 assert.deepEqual((await readBackupFile(pack)).project,p);
});
test('corrupted, missing and extra binary content are rejected before restore',async()=>{
 const {p,records}=await sample(),pack=await encodeBackup(p,records),bytes=new Uint8Array(await pack.arrayBuffer());bytes[bytes.length-1]^=1;
 await assert.rejects(decodeBackup(new Blob([bytes])),/dañado/);await assert.rejects(decodeBackup(pack.slice(0,pack.size-1)),/incompleto/);await assert.rejects(decodeBackup(new Blob([pack,'x'])),/sobrantes/);
 await assert.rejects(encodeBackup(p,[]));await assert.rejects(encodeBackup(p,[...records,...records]));
 const header=new Uint8Array(await pack.slice(0,12).arrayBuffer());new DataView(header.buffer).setUint32(8,0xffffffff,true);await assert.rejects(decodeBackup(new Blob([header,pack.slice(12)])),/Cabecera/);
});
test('V8 and legacy JSON remain readable; JSON cannot silently drop external files',async()=>{
 const p=createProject(),{assets,...old}=p;old.schemaVersion=8;const next=parseProject(old);assert.deepEqual(next,p);
 assert.deepEqual((await readBackupFile(new Blob([JSON.stringify(old)]))).project,p);
 const sampleData=await sample();await assert.rejects(readBackupFile(new Blob([JSON.stringify(sampleData.p)])),/copia completa/);
 assert.throws(()=>parseProject({...p,photos:[{id:newId()}]}));assert.throws(()=>parseProject({...p,models:[{id:newId()}]}));
 assert.throws(()=>parseProject({...sampleData.p,assets:[...sampleData.p.assets,...sampleData.p.assets]}));
});
