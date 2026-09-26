'use client';
import {roomWalls} from '../geometry/outline.ts';
import {collisionWarnings} from '../collisions/objects.ts';
import {DoorSwingFields} from './DoorSwingFields';
import {upsertOpening} from '../domain/model.ts';
import type {DoorSwing} from '../domain/door-swing.ts';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {valueCm,validationMessage,type Project} from '../domain/model.ts';
import {WALL_IDS,wallLabels,type WallId} from '../domain/openings.ts';
import {moveOpening} from '../domain/move-opening.ts';
export function OpeningPosition({project,id,onChange,onClose}:{project:Project;id:string;onChange:(p:Project)=>void;onClose:()=>void}){
 const o=project.room.fixedElements.find(o=>o.id===id)!;
 const [swing,setSwing]=useState<DoorSwing|undefined>(o.swing);
 const [wall,setWall]=useState<WallId>(o.wallId),[offset,setOffset]=useState(String(valueCm(o.offset))),[sill,setSill]=useState(String(valueCm(o.sill))),[error,setError]=useState('');
 return <section className="opening-position"><h2>{o.name} · {o.kind==='door'?'Puerta':'Ventana'}</h2><p>Arrastra en el plano a lo largo de su pared. Cambia de pared o introduce una posición exacta aquí.</p><form onSubmit={e=>{e.preventDefault();try{const number=(s:string)=>{if(!/^\d+(?:[.,]\d+)?$/.test(s.trim()))throw new Error('Introduce una posición válida en cm.');return Number(s.replace(',','.'));};const moved=moveOpening(project,id,wall,number(offset),o.kind==='window'?number(sill):undefined);onChange(upsertOpening(moved,{...moved.room.fixedElements.find(v=>v.id===id)!,swing}));setError('');}catch(e){setError(validationMessage(e));}}}>
 <label>Pared<NativeSelect aria-label="Mover a pared" value={wall} onChange={e=>setWall(e.target.value as WallId)}>{roomWalls(project.room).map(({id:w,label})=><NativeSelectOption key={w} value={w}>{label}</NativeSelectOption>)}</NativeSelect></label>
 <label>Distancia desde el inicio (cm)<Input aria-label="Posición del hueco" inputMode="decimal" value={offset} onChange={e=>setOffset(e.target.value)}/></label>
 {o.kind==='window'&&<label>Altura desde el suelo (cm)<Input aria-label="Altura de la ventana" inputMode="decimal" value={sill} onChange={e=>setSill(e.target.value)}/></label>}
 {o.kind==='door'&&<DoorSwingFields value={swing} onChange={setSwing} horizontal={wall==='north'||wall==='south'}/>}
 <Button type="submit">Aplicar posición y apertura</Button><Button type="button" variant="ghost" onClick={onClose}>Deseleccionar hueco</Button></form>{(collisionWarnings(project.room,project.objects).get(o.id)??[]).map(message=><p className="error-message" key={message}>{message}</p>)}{error&&<p role="alert" className="error-message">{error}</p>}</section>;
}
