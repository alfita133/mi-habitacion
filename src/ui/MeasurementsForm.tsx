'use client';
import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DIMENSION_KEYS, type Project, type DimensionKey, valueCm, sourceLabel, setManualDimensions, validationMessage } from '../domain/model.ts';
const labels:Record<DimensionKey,string>={width:'Ancho',depth:'Largo',height:'Alto'};
export function MeasurementsForm({project,onChange}:{project:Project;onChange:(p:Project)=>void}) {
  const initial=Object.fromEntries(DIMENSION_KEYS.map(k=>[k,project.room.dimensions[k].manualCm?.toString()??''])) as Record<DimensionKey,string>;
  const [draft,setDraft]=useState(initial),[error,setError]=useState('');
  const dirty=DIMENSION_KEYS.some(k=>draft[k]!==initial[k]);
  function apply(event:React.FormEvent){
    event.preventDefault();
    const values={} as Record<DimensionKey,number|null>;
    for(const key of DIMENSION_KEYS){
      const raw=draft[key].trim();
      if(raw===''){values[key]=null;continue;}
      const n=Number(raw.replace(',','.')),max=key==='height'?1000:2000;
      if(!/^\d+(?:[.,]\d+)?$/.test(raw)||!Number.isFinite(n)||n<50||n>max){setError(`${labels[key]}: introduce un número entre 50 y ${max} cm.`);return;}
      values[key]=n;
    }
    try {onChange(setManualDimensions(project,values));setError('');}
    catch(error) {setError(validationMessage(error));}
  }
  return <form onSubmit={apply} className="measure-form" noValidate>
    <h2><Ruler size={18}/> Medidas reales</h2>
    <p className="muted">Mide el interior, de pared a pared.</p>
    {DIMENSION_KEYS.map(key=><div className="measure-row" key={key}>
      <label htmlFor={`measure-${key}`}>{labels[key]} <span className={`source ${sourceLabel(project.room.dimensions[key])==='Real'?'real':''}`}>{sourceLabel(project.room.dimensions[key])}</span></label>
      <div className="unit-input"><Input id={`measure-${key}`} inputMode="decimal" autoComplete="off" placeholder={String(valueCm(project.room.dimensions[key]))} value={draft[key]} onChange={e=>{setDraft({...draft,[key]:e.target.value});setError('');}} aria-describedby="measure-help"/><span>cm</span></div>
    </div>)}
    <p id="measure-help" className="helper">Tus medidas tienen prioridad. Un campo vacío usa la estimación disponible o el ejemplo.</p>
    {error&&<p role="alert" className="error-message">{error}</p>}
    <Button type="submit" disabled={!dirty} className="apply-button">Aplicar medidas</Button>
    {dirty&&<p className="helper pending">Cambios pendientes de aplicar</p>}
  </form>;
}
