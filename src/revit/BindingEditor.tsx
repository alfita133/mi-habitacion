'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {type Project,validationMessage} from '../domain/model.ts';
import {editBinding} from './operations.ts';
import {Parameters} from './Parameters';
export function BindingEditor({project,id,onChange}:{project:Project;id:string;onChange:(p:Project)=>void}){
 const o=project.objects.find(o=>o.id===id)??project.room.fixedElements.find(o=>o.id===id),binding=o?.revit;
 const [typeId,setTypeId]=useState(binding?.typeId??''),[values,setValues]=useState(binding?.parameters??{}),[error,setError]=useState('');
 const family=project.families.find(f=>f.id===binding?.familyId),type=family?.types.find(t=>t.id===typeId);if(!binding||!family||!type)return null;
 return <details className="revit-binding"><summary>Familia Revit: {family.name}</summary><p>Las dimensiones medidas del objeto tienen prioridad. Cambiar parámetros no regenera la geometría Revit en la web.</p><label>Tipo<NativeSelect aria-label="Tipo Revit del objeto" value={typeId} onChange={e=>{setTypeId(e.target.value);setValues({});}}>{family.types.map(t=><NativeSelectOption key={t.id} value={t.id}>{t.name}</NativeSelectOption>)}</NativeSelect></label><Parameters type={type} values={values} onChange={setValues}/><Button onClick={()=>{try{onChange(editBinding(project,id,{familyId:family.id,typeId,parameters:values}));setError('');}catch(e){setError(validationMessage(e));}}}>Guardar parámetros Revit</Button>{error&&<p role="alert">{error}</p>}</details>;
}
