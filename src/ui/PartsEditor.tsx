'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {cm,type MovableObject} from '../domain/objects.ts';
import {newId,upsertObject,validationMessage,type Project} from '../domain/model.ts';
import {templateParts,templateNames,type Template} from '../domain/templates.ts';
import type {Part} from '../domain/parts.ts';
import {objectSolids,solidFootprint} from '../geometry/object-parts.ts';
export function PartsEditor({project,object,onChange}:{project:Project;object:MovableObject;onChange:(p:Project)=>void}){
 const [open,setOpen]=useState(false);
 return <><Button variant="outline" onClick={()=>setOpen(true)}>Forma y colisiones</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="opening-dialog"><DialogTitle>Forma y colisiones · {object.name}</DialogTitle><DialogDescription>Un objeto compuesto por piezas. Los huecos entre ellas quedan libres.</DialogDescription>{open&&<PartsForm object={object} onSave={model=>{onChange(upsertObject(project,{...object,model}));setOpen(false);}}/>}</DialogContent></Dialog></>;
}
function PartsForm({object,onSave}:{object:MovableObject;onSave:(model:MovableObject['model'])=>void}){
 const [parts,setParts]=useState<Part[]>(()=>object.model.kind==='compound'?structuredClone(object.model.parts):templateParts('custom'));
 const [selected,setSelected]=useState(parts[0].id),[template,setTemplate]=useState<Template>('custom'),[error,setError]=useState('');
 const w=cm(object.dimensions.width),d=cm(object.dimensions.depth),h=cm(object.dimensions.height),active=parts.find(p=>p.id===selected)!;
 const factors={x:w,y:d,z:h,width:w,depth:d,height:h,rotationDeg:1};
 const labels={x:'Centro X local',y:'Centro Y local',z:'Base Z local',width:'Ancho de pieza',depth:'Fondo de pieza',height:'Alto de pieza',rotationDeg:'Giro de pieza'};
 function change(value:Partial<Part>){setParts(parts.map(p=>p.id===selected?{...p,...value}:p));}
 const preview=objectSolids({...object,position:{x:0,y:0,z:0},rotationDeg:0,model:{kind:'compound',source:'manual-approximation',parts:parts.filter(p=>Object.values(p).every(v=>typeof v!=='number'||Number.isFinite(v)))}});
 return <div className="measure-form"><p className="helper">Envolvente medida: {w} × {d} × {h} cm. X/Y locales parten del centro; Z del suelo del objeto. Las piezas deben quedar dentro. Cambiar el tamaño general escala las piezas proporcionalmente; no simula un mecanismo elevable.</p>
 <label>Plantilla inicial<NativeSelect aria-label="Plantilla de forma" value={template} onChange={e=>setTemplate(e.target.value as Template)}>{Object.entries(templateNames).map(([k,v])=><NativeSelectOption value={k} key={k}>{v}</NativeSelectOption>)}</NativeSelect></label><Button variant="outline" onClick={()=>{const next=templateParts(template);setParts(next);setSelected(next[0].id);setError('');}}>Reemplazar borrador por plantilla</Button>
 <div className="parts-preview"><svg viewBox={`${-w*.6} ${-d*.6} ${w*1.2} ${d*1.2}`} role="img" aria-label="Piezas transparentes desde arriba"><rect x={-w/2} y={-d/2} width={w} height={d} fill="none" stroke="#94a3b8" strokeDasharray="3 3"/>{preview.map(p=><polygon key={p.partId} points={solidFootprint(p,false).map(v=>`${v.x},${v.y}`).join(' ')} fill={p.partId===selected?'#2563eb':'#64748b'} fillOpacity={.3} stroke={p.partId===selected?'#1d4ed8':'#64748b'} strokeWidth={w/180}/>)}</svg><svg viewBox={`${-w*.6} ${-h*1.1} ${w*1.2} ${h*1.2}`} role="img" aria-label="Piezas transparentes desde delante">{preview.map(p=><rect key={p.partId} x={p.position.x-cm(p.dimensions.width)/2} y={-p.position.z-cm(p.dimensions.height)} width={cm(p.dimensions.width)} height={cm(p.dimensions.height)} fill={p.partId===selected?'#2563eb':'#64748b'} fillOpacity={.3} stroke="#64748b" strokeWidth={w/180}/>)}</svg></div><p className="helper">Arriba: huellas. Delante: cajas de referencia. Las colisiones respetan el volumen curvo de cilindros y elipsoides; tocar sin penetrar no genera aviso.</p>
 <label>Pieza<NativeSelect aria-label="Pieza seleccionada" value={selected} onChange={e=>setSelected(e.target.value)}>{parts.map((p,i)=><NativeSelectOption key={p.id} value={p.id}>{i+1}. {p.name}</NativeSelectOption>)}</NativeSelect></label>
 <div className="file-actions"><Button variant="outline" disabled={parts.length>=32} onClick={()=>{const p={...templateParts('custom')[0],name:'Nueva pieza',width:.1,depth:.1,height:.1};setParts([...parts,p]);setSelected(p.id);}}>Añadir pieza</Button><Button variant="outline" disabled={parts.length>=32} onClick={()=>{const p={...active,id:newId(),name:active.name+' copia'};setParts([...parts,p]);setSelected(p.id);}}>Duplicar pieza</Button><Button variant="outline" disabled={parts.length===1} onClick={()=>{const next=parts.filter(p=>p.id!==selected);setParts(next);setSelected(next[0].id);}}>Quitar pieza</Button></div>
 <label>Nombre de pieza<Input aria-label="Nombre de pieza" value={active.name} onChange={e=>change({name:e.target.value})}/></label><label>Forma<NativeSelect aria-label="Forma de pieza" value={active.shape} onChange={e=>change({shape:e.target.value as Part['shape']})}><NativeSelectOption value="box">Caja</NativeSelectOption><NativeSelectOption value="cylinder">Cilindro vertical / elíptico</NativeSelectOption><NativeSelectOption value="ellipsoid">Elipsoide (almohada, cabezal)</NativeSelectOption></NativeSelect></label>
 <div className="object-fields">{(Object.keys(labels) as (keyof typeof labels)[]).map(k=><label key={k}>{labels[k]} ({k==='rotationDeg'?'°':'cm'})<Input aria-label={labels[k]} type="number" step="any" value={Number.isFinite(active[k])?Number((active[k]*factors[k]).toFixed(4)):''} onChange={e=>change({[k]:e.target.value===''?NaN:Number(e.target.value)/factors[k]})}/></label>)}</div>
 {error&&<p role="alert" className="error-message">{error}</p>}<Button onClick={()=>{try{onSave({kind:'compound',source:'manual-approximation',parts});}catch(e){setError(validationMessage(e));}}}>Guardar forma</Button><p className="helper">Plantillas aproximadas: revisa cada medida. Guardar conserva posición, grupo y familia Revit. Cancelar o cerrar descarta el borrador; deshacer revierte la forma guardada.</p></div>;
}
