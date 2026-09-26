'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';
import {newId,valueCm,validationMessage,type Project} from '../domain/model.ts';
import type {FixedVolume} from '../domain/fixed-volumes.ts';
import {upsertFixedVolume,removeFixedVolume} from '../domain/fixed-volume-operations.ts';
import {collisionWarnings} from '../collisions/objects.ts';
import {CoordinateGuide} from './CoordinateGuide';
export function FixedVolumesPanel({project,onChange,editingId,onEdit}:{project:Project;onChange:(p:Project)=>void;editingId:string|null|undefined;onEdit:(id:string|null|undefined)=>void}){
 const [open,setOpen]=useState(false),[removing,setRemoving]=useState<string|null>(null);
 const warnings=collisionWarnings(project.room,project.objects),active=project.room.fixedVolumes.find(v=>v.id===editingId);
 return <><Button variant="outline" onClick={()=>setOpen(true)}>Elementos fijos ({project.room.fixedVolumes.length})</Button>
 <Dialog open={open} onOpenChange={setOpen}><DialogContent className="opening-dialog"><DialogTitle>Elementos fijos interiores</DialogTitle><DialogDescription>Define pilares, radiadores u otros volúmenes que quieras considerar fijos. Se editan aquí y no se arrastran como muebles.</DialogDescription>
 <ul className="structure-list">{project.room.fixedVolumes.map(v=><li key={v.id} className={warnings.has(v.id)?'collision-row':''}><div><strong>{v.name}</strong><span>{valueCm(v.dimensions.width)} × {valueCm(v.dimensions.depth)} × {valueCm(v.dimensions.height)} cm{warnings.has(v.id)?' · Colisión':''}</span></div><Button variant="outline" onClick={()=>onEdit(v.id)}>Editar {v.name}</Button><Button variant="ghost" onClick={()=>setRemoving(v.id)}>Eliminar {v.name}</Button></li>)}</ul>
 {!project.room.fixedVolumes.length&&<p>Todavía no has definido obstáculos interiores.</p>}<Button disabled={project.room.fixedVolumes.length>=64} onClick={()=>onEdit(null)}>Añadir elemento fijo</Button>
 </DialogContent></Dialog>
 <Dialog open={editingId!==undefined} onOpenChange={v=>{if(!v)onEdit(undefined);}}><DialogContent className="opening-dialog"><DialogTitle>{active?'Editar elemento fijo':'Añadir elemento fijo'}</DialogTitle><DialogDescription>Posición y medidas en cm. Los solapamientos avisan en rojo y permiten guardar.</DialogDescription>{editingId!==undefined&&<FixedForm key={editingId??'new'} project={project} value={active} onSave={p=>{onChange(p);onEdit(undefined);}}/>}</DialogContent></Dialog>
 <AlertDialog open={!!removing} onOpenChange={v=>{if(!v)setRemoving(null);}}><AlertDialogContent><AlertDialogTitle>¿Eliminar elemento fijo?</AlertDialogTitle><AlertDialogDescription>Se eliminará {project.room.fixedVolumes.find(v=>v.id===removing)?.name} de la estructura y dejará de contar en las colisiones. Puedes deshacerlo.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={()=>{if(removing)onChange(removeFixedVolume(project,removing));setRemoving(null);}}>Eliminar elemento fijo</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
 </>;
}
function FixedForm({project,value,onSave}:{project:Project;value?:FixedVolume;onSave:(p:Project)=>void}){
 const [name,setName]=useState(value?.name??''),[color,setColor]=useState(value?.color??'#64748b'),[error,setError]=useState('');
 const [numbers,setNumbers]=useState({width:value?String(valueCm(value.dimensions.width)):'',depth:value?String(valueCm(value.dimensions.depth)):'',height:value?String(valueCm(value.dimensions.height)):'',x:String(value?.position.x??100),y:String(value?.position.y??100),z:String(value?.position.z??0),rotation:String(value?.rotationDeg??0)});
 const [touched,setTouched]=useState<Partial<Record<keyof typeof numbers,boolean>>>({});
 const labels={width:'Ancho fijo (cm)',depth:'Fondo fijo (cm)',height:'Alto fijo (cm)',x:'Centro X fijo (cm)',y:'Centro Y fijo (cm)',z:'Base Z fija (cm)',rotation:'Giro fijo (°)'};
 return <form className="opening-form" onSubmit={e=>{e.preventDefault();try{
 const n={} as Record<keyof typeof numbers,number>;for(const key of Object.keys(numbers) as (keyof typeof numbers)[]){if(!/^-?\d+(?:[.,]\d+)?$/.test(numbers[key].trim()))throw new Error(`${labels[key]}: introduce un número válido.`);n[key]=Number(numbers[key].replace(',','.'));}
 const measure=(axis:'width'|'depth'|'height')=>value&&!touched[axis]?value.dimensions[axis]:{defaultCm:n[axis],estimatedCm:value?.dimensions[axis].estimatedCm??null,manualCm:n[axis]};
 onSave(upsertFixedVolume(project,{id:value?.id??newId(),name,color,position:{x:n.x,y:n.y,z:n.z},rotationDeg:n.rotation,dimensions:{width:measure('width'),depth:measure('depth'),height:measure('height')}}));
 }catch(err){setError(validationMessage(err));}}} noValidate>
 <details><summary>Ayuda con coordenadas</summary><CoordinateGuide room={project.room}/></details><label>Nombre del elemento fijo<Input aria-label="Nombre del elemento fijo" maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></label>
 <div className="opening-fields">{(Object.keys(labels) as (keyof typeof numbers)[]).map(key=><label key={key}>{labels[key]}<Input aria-label={labels[key]} inputMode="decimal" value={numbers[key]} onChange={e=>{setNumbers({...numbers,[key]:e.target.value});setTouched({...touched,[key]:true});}}/></label>)}</div>
 <label>Color del elemento fijo<Input type="color" aria-label="Color del elemento fijo" value={color} onChange={e=>setColor(e.target.value)}/></label>
 {value&&(collisionWarnings(project.room,project.objects).get(value.id)??[]).map(message=><p className="error-message" key={message}>{message}</p>)}
 {error&&<p role="alert" className="error-message">{error}</p>}<Button type="submit">Guardar elemento fijo interior</Button></form>;
}
