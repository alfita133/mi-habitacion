'use client';
import {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {type Project,upsertObject,validationMessage} from '../domain/model.ts';
import {entityBounds,translateEntity} from '../domain/groups.ts';
import {cm,type MovableObject} from '../domain/objects.ts';
export function ObjectTransform({project,object,onChange}:{project:Project;object:MovableObject;onChange:(p:Project)=>void}){
 const b=entityBounds(project,object.id),group=!!object.groupId;
 const [draft,setDraft]=useState({x:String(b.x),y:String(b.y),z:String(b.z),width:String(cm(object.dimensions.width)),depth:String(cm(object.dimensions.depth)),height:String(cm(object.dimensions.height))}),[error,setError]=useState('');
 return <form className="transform-form" onSubmit={e=>{e.preventDefault();try{const number=(key:keyof typeof draft)=>{if(!/^-?\d+(?:[.,]\d+)?$/.test(draft[key]))throw new Error('Introduce medidas válidas.');return Number(draft[key].replace(',','.'));};const measure=(key:'width'|'depth'|'height')=>draft[key]===String(cm(object.dimensions[key]))?object.dimensions[key]:{...object.dimensions[key],manualCm:number(key)};let p=translateEntity(project,object.id,number('x')-b.x,number('y')-b.y,number('z')-b.z);if(!group){const moved=p.objects.find(o=>o.id===object.id)!;p=upsertObject(p,{...moved,dimensions:{width:measure('width'),depth:measure('depth'),height:measure('height')}});}onChange(p);setError('');}catch(e){setError(validationMessage(e));}}}>
 <h4>Posición y tamaño · cm</h4><div className="transform-fields">{(['x','y','z',...(!group?['width','depth','height']:[])] as (keyof typeof draft)[]).map(k=><label key={k}>{{x:'Centro X',y:'Centro Y',z:'Base Z',width:'Ancho',depth:'Fondo',height:'Alto'}[k]}<Input aria-label={`Selección ${{x:"X",y:"Y",z:"Z",width:"ancho",depth:"fondo",height:"alto"}[k]}`} inputMode="decimal" value={draft[k]} onChange={e=>setDraft({...draft,[k]:e.target.value})}/></label>)}</div><Button type="submit" variant="outline">Aplicar posición y tamaño</Button>{error&&<p role="alert">{error}</p>}</form>;
}
