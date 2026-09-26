import {initialCollection,parseCollection,type RoomCollection} from '../domain/rooms.ts';
import type {Project} from '../domain/model.ts';
import {verifyAsset,type AssetBlob} from './assets.ts';
export function openDatabase():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{
 const req=indexedDB.open('mi-habitacion',2);let blocked=false;
 req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('projects'))req.result.createObjectStore('projects');if(!req.result.objectStoreNames.contains('assets'))req.result.createObjectStore('assets');};
 req.onerror=()=>reject(req.error);req.onblocked=()=>{blocked=true;reject(new Error('Cierra otras pestañas y vuelve a intentarlo.'));};
 req.onsuccess=()=>{if(blocked){req.result.close();return;}req.result.onversionchange=()=>req.result.close();resolve(req.result);};
});}
export async function loadCollection():Promise<RoomCollection>{
 await writes.catch(()=>{});
 const db=await openDatabase();try{return await new Promise((resolve,reject)=>{
 const tx=db.transaction('projects','readwrite'),store=tx.objectStore('projects');let result:RoomCollection;
 const req=store.get('collection');
 req.onsuccess=()=>{try{if(req.result!==undefined){result=parseCollection(req.result);}else{
 const legacy=store.get('current');legacy.onsuccess=()=>{try{result=initialCollection(legacy.result);store.put(result,'collection');}catch(e){reject(e);tx.abort();}};
 }}catch(e){reject(e);tx.abort();}};
 tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(new Error('No se pudo abrir. Los datos guardados se conservan intactos.'));
 });}finally{db.close();}
}
let writes:Promise<void>=Promise.resolve();
export function saveCollection(value:RoomCollection,additions:AssetBlob[]=[]):Promise<void>{
 const snapshot=parseCollection(value),records=[...additions];
 const pending=writes.catch(()=>{}).then(async()=>{
 const allRefs=snapshot.projects.flatMap(p=>p.assets),references=new Map(allRefs.map(a=>[a.sha256,a]));
 for(const ref of allRefs)if(references.get(ref.sha256)!.byteLength!==ref.byteLength)throw new Error('Referencia de archivo incompatible entre habitaciones.');
 const supplied=new Map(records.map(a=>[a.sha256,a.blob]));
 if(supplied.size!==records.length)throw new Error('Datos binarios duplicados.');
 for(const [hash,blob] of supplied){const reference=references.get(hash);if(!reference)throw new Error('Archivo sin referencia en la colección.');await verifyAsset(reference,blob);}
 const db=await openDatabase();try{await new Promise<void>((resolve,reject)=>{
 const tx=db.transaction(['projects','assets'],'readwrite'),assets=tx.objectStore('assets');let failure:Error|null=null;
 const abort=(message:string)=>{failure=new Error(message);tx.abort();};
 tx.oncomplete=()=>resolve();tx.onerror=()=>reject(failure??tx.error);tx.onabort=()=>reject(failure??tx.error??new Error('Guardado cancelado. No se ha guardado una copia parcial.'));
 try{for(const [hash,ref] of references){
  const blob=supplied.get(hash);
  if(blob){assets.put(blob,hash);continue;}
  const request=assets.get(hash);request.onsuccess=()=>{if(!failure&&(!(request.result instanceof Blob)||request.result.size!==ref.byteLength))abort(`Falta el archivo ${ref.fileName}. Abre una copia completa.`);};
 }
 tx.objectStore('projects').put(snapshot,'collection');
 }catch(error){failure=error instanceof Error?error:new Error('No se pudo escribir la copia.');tx.abort();}
 });}finally{db.close();}
 });writes=pending;return pending;
}
export async function readProjectAssets(project:Project):Promise<AssetBlob[]>{
 await writes.catch(()=>{});const db=await openDatabase();
 try{return await new Promise((resolve,reject)=>{
 const tx=db.transaction('assets','readonly'),store=tx.objectStore('assets'),records:AssetBlob[]=[];let missing=false;
 for(const ref of new Map(project.assets.map(a=>[a.sha256,a])).values()){
 const req=store.get(ref.sha256);req.onsuccess=()=>{if(!(req.result instanceof Blob)||req.result.size!==ref.byteLength){missing=true;reject(new Error(`No se encuentra ${ref.fileName}. No se ha generado una copia incompleta.`));}else records.push({sha256:ref.sha256,blob:req.result});};
 }
 tx.oncomplete=()=>{if(!missing)resolve(records);};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 });}finally{db.close();}
}
