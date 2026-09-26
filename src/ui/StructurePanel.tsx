'use client';
import {roomWalls} from '../geometry/outline.ts';
import {DoorSwingFields} from './DoorSwingFields';
import {defaultDoorSwing,type DoorSwing} from '../domain/door-swing.ts';
import { useState } from 'react';
import { DoorOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect,NativeSelectOption } from '@/components/ui/native-select';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import { AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction } from '@/components/ui/alert-dialog';
import { type Project,newId,valueCm,upsertOpening,removeOpening,validationMessage } from '../domain/model.ts';
import { WALL_IDS,wallLabels,measured,type Opening,type WallId } from '../domain/openings.ts';

export function StructurePanel({project,onChange}:{project:Project;onChange:(p:Project)=>void}){
  const [editing,setEditing]=useState<Opening|null|undefined>(undefined);
  const [removing,setRemoving]=useState<Opening|null>(null);
  return <section className="structure-panel" aria-labelledby="structure-title">
    <h2 id="structure-title"><DoorOpen size={18}/> Puertas y ventanas</h2>
    <p className="helper">Elementos fijos de la habitación.</p>
    {project.room.fixedElements.length===0?<p className="structure-empty">Todavía no has definido ningún hueco.</p>:<ul className="structure-list">{project.room.fixedElements.map(o=><li key={o.id}>
      <div><strong>{o.name}</strong><span>{roomWalls(project.room).find(w=>w.id===o.wallId)?.label} · {valueCm(o.width)} × {valueCm(o.height)} cm</span></div>
      <Button variant="ghost" size="icon" aria-label={`Editar ${o.name}`} onClick={()=>setEditing(o)}><Pencil size={16}/></Button>
      <Button variant="ghost" size="icon" aria-label={`Eliminar elemento fijo ${o.name}`} onClick={()=>setRemoving(o)}><Trash2 size={16}/></Button>
    </li>)}</ul>}
    <Button variant="outline" className="structure-add" onClick={()=>setEditing(null)} disabled={project.room.fixedElements.length>=64}><Plus/> Añadir hueco</Button>
    <Dialog open={editing!==undefined} onOpenChange={open=>{if(!open)setEditing(undefined);}}>
      <DialogContent className="opening-dialog"><DialogTitle>{editing?'Editar elemento fijo':'Añadir puerta o ventana'}</DialogTitle><DialogDescription>Mide el hueco en la pared. Se actualizará en las dos vistas.</DialogDescription>
        {editing!==undefined&&<OpeningForm key={editing?.id??'new'} project={project} opening={editing} onSave={p=>{onChange(p);setEditing(undefined);}} onCancel={()=>setEditing(undefined)}/>}
      </DialogContent>
    </Dialog>
    <AlertDialog open={!!removing} onOpenChange={open=>{if(!open)setRemoving(null);}}><AlertDialogContent><AlertDialogTitle>¿Eliminar este elemento fijo?</AlertDialogTitle><AlertDialogDescription>Se eliminará {removing?.name} y se cerrará su hueco en la pared. Esta acción modifica la estructura.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={()=>{if(removing)onChange(removeOpening(project,removing.id));setRemoving(null);}}>Eliminar hueco</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}
function OpeningForm({project,opening,onSave,onCancel}:{project:Project;opening:Opening|null;onSave:(p:Project)=>void;onCancel:()=>void}){
  const [kind,setKind]=useState<Opening['kind']>(opening?.kind??'door'),[wallId,setWallId]=useState<WallId>(opening?.wallId??roomWalls(project.room)[0].id);
  const [name,setName]=useState(opening?.name??'');
  const [values,setValues]=useState({width:opening?String(valueCm(opening.width)):'',height:opening?String(valueCm(opening.height)):'',offset:opening?String(valueCm(opening.offset)):'',sill:opening?String(valueCm(opening.sill)):''});
  const [swing,setSwing]=useState<DoorSwing|undefined>(opening?opening.swing:defaultDoorSwing());
  const [error,setError]=useState('');
  const [touched,setTouched]=useState<Partial<Record<keyof typeof values,boolean>>>({});
  const fields=['width','height','offset',...(kind==='window'?['sill']:[])] as (keyof typeof values)[];
  const labels={width:'Ancho del hueco',height:'Alto del hueco',offset:'Distancia desde el inicio de pared',sill:'Altura desde el suelo'};
  function save(event:React.FormEvent){
    event.preventDefault();setError('');
    const numbers={width:0,height:0,offset:0,sill:0};
    for(const key of fields){
      const raw=values[key].trim(),n=Number(raw.replace(',','.'));
      if(!/^\d+(?:[.,]\d+)?$/.test(raw)||!Number.isFinite(n)||n<(key==='width'||key==='height'?1:0)){setError(`${labels[key]}: introduce una medida válida en cm.`);return;}
      numbers[key]=n;
    }
    const preserve=(key:keyof typeof values)=>opening?(!touched[key]&&!(kind==='door'&&key==='sill'&&opening.kind==='window')?opening[key]:{...opening[key],manualCm:numbers[key]}):measured(numbers[key]);
    const next:Opening={...(opening?.revit?{revit:opening.revit}:{}),...(kind==='door'&&swing?{swing}:{}),id:opening?.id??newId(),kind,wallId,name:name.trim()||(kind==='door'?'Puerta':'Ventana'),width:preserve('width'),height:preserve('height'),offset:preserve('offset'),sill:preserve('sill')};
    try {onSave(upsertOpening(project,next));}catch(err){setError(validationMessage(err));}
  }
  return <form className="opening-form" onSubmit={save} noValidate>
    <div className="opening-fields"><label>Tipo<NativeSelect value={kind} onChange={e=>setKind(e.target.value as Opening['kind'])} aria-label="Tipo de hueco"><NativeSelectOption value="door">Puerta</NativeSelectOption><NativeSelectOption value="window">Ventana</NativeSelectOption></NativeSelect></label>
    <label>Pared<NativeSelect value={wallId} onChange={e=>setWallId(e.target.value as WallId)} aria-label="Pared del hueco">{roomWalls(project.room).map(({id:w,label})=><NativeSelectOption key={w} value={w}>{label}</NativeSelectOption>)}</NativeSelect></label></div>
    <label htmlFor="opening-name">Nombre<Input id="opening-name" value={name} onChange={e=>setName(e.target.value)} maxLength={80} placeholder={kind==='door'?'Puerta':'Ventana'}/></label>
    <p className="helper">Las posiciones se miden desde el inicio de la pared indicada en el plano, en cm.</p>
    <div className="opening-fields">{fields.map(key=><label key={key} htmlFor={`opening-${key}`}>{labels[key]}<div className="unit-input"><Input id={`opening-${key}`} inputMode="decimal" value={values[key]} onChange={e=>{setValues({...values,[key]:e.target.value});setTouched({...touched,[key]:true});setError('');}} placeholder={key==='offset'?'0':undefined}/><span>cm</span></div></label>)}</div>
    {kind==='door'?<DoorSwingFields value={swing} onChange={setSwing} horizontal={wallId==='north'||wallId==='south'}/>:<p className="helper">Ventana con marco y vidrio aproximados. Las medidas corresponden al hueco completo.</p>}
    {error&&<p role="alert" className="error-message">{error}</p>}
    <div className="opening-actions"><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button><Button type="submit">Guardar elemento fijo</Button></div>
  </form>;
}
