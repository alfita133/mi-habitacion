'use client';
import {useEffect,useRef,useState} from 'react';
import {type Project} from '../domain/model.ts';
import {addRoom,duplicateRoom,type RoomCollection,parseCollection} from '../domain/rooms.ts';
import type {PreparedBackup} from '../persistence/backup';
import {loadCollection,saveCollection} from '../persistence/database';
export function useProject(){
 const [collection,setCollection]=useState<RoomCollection|null>(null),[storageMessage,setMessage]=useState('Abriendo habitaciones…'),[storageError,setError]=useState(false);
 const [busy,setBusy]=useState(false),restoring=useRef(false);
 const current=useRef<RoomCollection|null>(null),revision=useRef(0);
 useEffect(()=>{let active=true;loadCollection().then(c=>{if(active){current.current=c;setCollection(c);setMessage('Guardado en este navegador');}}).catch(()=>{if(active){setError(true);setMessage('No se pudieron abrir las habitaciones. Los datos se conservan. Cierra otras pestañas y recarga.');}});return ()=>{active=false;};},[]);
 function update(fn:(c:RoomCollection)=>RoomCollection){if(!current.current)return;if(restoring.current)throw new Error('Espera a que termine de abrirse la copia.');const next=parseCollection(fn(current.current));current.current=next;setCollection(next);setMessage('Guardando…');setError(false);const rev=++revision.current;
 saveCollection(next).then(()=>{if(rev===revision.current)setMessage('Guardado en este navegador');}).catch(()=>{if(rev===revision.current){setError(true);setMessage('No se pudo guardar. Exporta cada habitación antes de cerrar.');}});
 }
 function setProject(p:Project){update(c=>({...c,projects:c.projects.map(r=>r.id===p.id?p:r)}));}
 async function importBackup(backup:PreparedBackup){
 if(!current.current||restoring.current)throw new Error('Espera a que termine la operación actual.');
 restoring.current=true;setBusy(true);const rev=++revision.current;
 try{
 const next=addRoom(current.current,duplicateRoom(backup.project,backup.project.name));
 await saveCollection(next,backup.blobs);current.current=next;setCollection(next);setError(false);setMessage('Copia completa abierta y guardada.');
 }catch(error){if(rev===revision.current){setError(true);setMessage('No se pudo abrir la copia. La habitación actual se conserva.');}throw error;}
 finally{restoring.current=false;setBusy(false);}
 }
 return {collection,update,busy,importBackup,project:collection?.projects.find(p=>p.id===collection.activeId)??null,setProject,storageMessage,storageError};
}
