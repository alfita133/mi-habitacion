'use client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Slider} from '@/components/ui/slider';
import {useId} from 'react';
export function HeightControl({label,value,max,min=0,onChange}:{label:string;value:number;max:number;min?:number;onChange:(n:number)=>void}){
 const id=useId();return <div className="height-control"><label htmlFor={id}>{label} (cm)</label><div className="height-buttons"><Button type="button" variant="outline" size="sm" aria-label={`Reducir ${label} 5 cm`} onClick={()=>onChange(Math.max(min,value-5))}>−5</Button><Input id={id} type="number" step="any" value={value} onChange={e=>{if(e.target.value!==''&&Number.isFinite(e.target.valueAsNumber))onChange(e.target.valueAsNumber);}}/><Button type="button" variant="outline" size="sm" aria-label={`Aumentar ${label} 5 cm`} onClick={()=>onChange(value+5)}>+5</Button></div><Slider aria-label={`${label}: ajuste rápido`} min={min} max={Math.max(max,min+1)} step={1} value={[Math.max(min,Math.min(value,max))]} onValueChange={v=>onChange(v[0])}/></div>;
}
