'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';
import {createProject,effectiveDimensions,validationMessage,type Project} from '../domain/model.ts';
import {addRoom,removeRoom,duplicateRoom,namedProject,type RoomCollection} from '../domain/rooms.ts';
import {roomOutline} from '../geometry/outline.ts';
import {footprint} from '../domain/objects.ts';
export function RoomsDialog({collection,onChange}:{collection:RoomCollection;onChange:(fn:(c:RoomCollection)=>RoomCollection)=>void}){
 const [open,setOpen]=useState(false),[name,setName]=useState(''),[rename,setRename]=useState<string|null>(null),[deleting,setDeleting]=useState<Project|null>(null),[error,setError]=useState('');
 function apply(fn:(c:RoomCollection)=>RoomCollection){try{onChange(fn);setError('');return true;}catch(e){setError(validationMessage(e));return false;}}
 return <><Button variant="outline" onClick={()=>setOpen(true)}>Mis habitaciones ({collection.projects.length})</Button>
 <Dialog open={open} onOpenChange={setOpen}><DialogContent className="rooms-dialog"><DialogTitle>Mis habitaciones</DialogTitle><DialogDescription>Guardadas en este navegador. Exporta cada habitación para llevarla a otro dispositivo.</DialogDescription>
 <form className="room-name-form" onSubmit={e=>{e.preventDefault();if(apply(c=>rename?{...c,projects:c.projects.map(p=>p.id===rename?namedProject(p,name):p)}:addRoom(c,namedProject(createProject(),name)))){setName('');setRename(null);}}}><label htmlFor="room-name">{rename?'Nuevo nombre':'Nombre de la nueva habitación'}</label><Input id="room-name" value={name} onChange={e=>setName(e.target.value)} required maxLength={80}/><Button type="submit">{rename?'Guardar nombre':'Crear habitación'}</Button>{rename&&<Button type="button" variant="ghost" onClick={()=>{setRename(null);setName('');}}>Cancelar nombre</Button>}</form>
 {error&&<p role="alert" className="error-message">{error}</p>}
 <div className="room-cards">{collection.projects.map(p=><article key={p.id} className={`room-card ${p.id===collection.activeId?'active':''}`}><RoomThumbnail project={p}/><h3>{p.name}</h3><p>{p.objects.length} objetos · {p.id===collection.activeId?'Abierta':new Date(p.updatedAt).toLocaleDateString('es-ES')}</p><div><Button onClick={()=>{apply(c=>({...c,activeId:p.id}));setOpen(false);}}>Abrir {p.name}</Button><Button variant="outline" onClick={()=>{setRename(p.id);setName(p.name);}}>Renombrar</Button><Button variant="outline" onClick={()=>apply(c=>addRoom(c,duplicateRoom(p,`${p.name.slice(0,70)} copia`)))}>Duplicar</Button><Button variant="ghost" disabled={collection.projects.length===1} onClick={()=>setDeleting(p)}>Eliminar</Button></div></article>)}</div>
 </DialogContent></Dialog>
 <AlertDialog open={!!deleting} onOpenChange={v=>{if(!v)setDeleting(null);}}><AlertDialogContent><AlertDialogTitle>¿Eliminar {deleting?.name}?</AlertDialogTitle><AlertDialogDescription>Se eliminará esta habitación guardada y sus objetos. Exporta una copia si quieres conservarla. Esta acción no se puede deshacer.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={()=>{if(deleting)apply(c=>removeRoom(c,deleting.id));setDeleting(null);}}>Eliminar habitación</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>;
}
function RoomThumbnail({project:p}:{project:Project}){const d=effectiveDimensions(p.room);return <svg className="room-thumbnail" viewBox={`-20 -20 ${d.width+40} ${d.depth+40}`} role="img" aria-label={`Miniatura de ${p.name}`}><polygon points={roomOutline(p.room).map(p=>`${p.x},${p.y}`).join(' ')} fill="#eef5ff" stroke="#425975" strokeWidth="8"/>{p.objects.filter(o=>!o.hidden).map(o=><polygon key={o.id} points={footprint(o).map(v=>`${v.x},${v.y}`).join(' ')} fill={o.material.color} stroke="#fff" strokeWidth="2"/>)}</svg>;}
