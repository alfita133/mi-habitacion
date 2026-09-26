import test from 'node:test';import assert from 'node:assert/strict';
import {IDBFactory,IDBObjectStore} from 'fake-indexeddb';
import {createProject,newId} from '../src/domain/model.ts';
import {addRoom,duplicateRoom} from '../src/domain/rooms.ts';
import {openDatabase,loadCollection,saveCollection,readProjectAssets} from '../src/persistence/database.ts';
import {hashBlob} from '../src/persistence/assets.ts';
import {encodeBackup,decodeBackup} from '../src/persistence/backup.ts';
const reset=()=>{globalThis.indexedDB=new IDBFactory();};
const collection=p=>({version:1,activeId:p.id,projects:[p]});
async function asset(text){const blob=new Blob([text]);const ref={id:newId(),fileName:'test.bin',mimeType:'application/octet-stream',byteLength:blob.size,sha256:await hashBlob(blob)};return {ref,record:{sha256:ref.sha256,blob}};}
async function assetCount(){const db=await openDatabase();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('assets','readonly'),q=tx.objectStore('assets').count();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});}finally{db.close();}}
test('IndexedDB v1 upgrades preserving legacy current and room collection',async()=>{
 reset();const p=createProject();delete p.assets;p.schemaVersion=8;
 await new Promise((resolve,reject)=>{const q=indexedDB.open('mi-habitacion',1);q.onupgradeneeded=()=>q.result.createObjectStore('projects');q.onsuccess=()=>{const db=q.result,tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(p,'current');tx.oncomplete=()=>{db.close();resolve();};};q.onerror=()=>reject(q.error);});
 const c=await loadCollection();assert.equal(c.projects[0].id,p.id);assert.equal(c.projects[0].schemaVersion,11);assert.deepEqual(c.projects[0].assets,[]);
 const db=await openDatabase();assert.equal(db.version,2);assert.ok(db.objectStoreNames.contains('assets'));await new Promise(resolve=>{const tx=db.transaction('projects','readonly'),q=tx.objectStore('projects').get('current');q.onsuccess=()=>{assert.deepEqual(q.result,p);resolve();};});db.close();
});
test('save, export, duplicate and restore keep blobs separate and reuse content',async()=>{
 reset();const p=createProject(),a=await asset('binary fixture');p.assets=[a.ref];let c=collection(p);await saveCollection(c,[a.record]);assert.deepEqual(await loadCollection(),c);assert.equal(await assetCount(),1);
 const records=await readProjectAssets(p),pack=await encodeBackup(p,records),backup=await decodeBackup(pack);c=addRoom(c,duplicateRoom(backup.project,'Restaurada'));await saveCollection(c,backup.blobs);assert.equal(await assetCount(),1);assert.equal((await loadCollection()).projects.length,2);
 assert.equal(await (await readProjectAssets(c.projects[1]))[0].blob.text(),'binary fixture');
});
test('missing data aborts collection and all new blobs; subsequent save recovers queue',async()=>{
 reset();const p=createProject(),before=collection(p);await saveCollection(before);const a=await asset('missing'),b=await asset('must roll back');const after=structuredClone(before);after.projects[0].assets=[a.ref,b.ref];
 await assert.rejects(saveCollection(after,[b.record]),/Falta el archivo/);assert.deepEqual(await loadCollection(),before);assert.equal(await assetCount(),0);
 await saveCollection(after,[a.record,b.record]);assert.equal(await assetCount(),2);assert.deepEqual(await loadCollection(),after);
});
test('simulated quota failure leaves old project and blobs intact',async()=>{
 reset();const p=createProject(),before=collection(p);await saveCollection(before);const a=await asset('quota fixture'),after=structuredClone(before);after.projects[0].assets=[a.ref];
 const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(this.name==='projects')throw new DOMException('quota test','QuotaExceededError');return original.call(this,value,key);};
 try{await assert.rejects(saveCollection(after,[a.record]),/quota test/);}finally{IDBObjectStore.prototype.put=original;}
 assert.equal(await assetCount(),0);assert.deepEqual(await loadCollection(),before);
});
test('hash mismatch cannot overwrite existing files or mutate collection',async()=>{
 reset();const p=createProject(),a=await asset('original');p.assets=[a.ref];const c=collection(p);await saveCollection(c,[a.record]);
 await assert.rejects(saveCollection(c,[{sha256:a.ref.sha256,blob:new Blob(['tampered'])}]),/dañado/);assert.equal(await (await readProjectAssets(p))[0].blob.text(),'original');assert.deepEqual(await loadCollection(),c);
});
