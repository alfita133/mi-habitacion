'use client';
import {Input} from '@/components/ui/input';
import {Switch} from '@/components/ui/switch';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {defaultDoorSwing,type DoorSwing} from '../domain/door-swing.ts';
export function DoorSwingFields({value,onChange,horizontal}:{value:DoorSwing|undefined;onChange:(v:DoorSwing|undefined)=>void;horizontal:boolean}){
 return <fieldset className="door-swing-fields"><legend>Apertura de la puerta</legend>
 <label className="door-swing-toggle">Definir hoja y apertura<Switch aria-label="Definir hoja y apertura" checked={!!value} onCheckedChange={v=>onChange(v?defaultDoorSwing():undefined)}/></label>
 {!value?<p className="helper">Activa la referencia para abrir y cerrar con el ratón.</p>:<>
 <div className="opening-fields"><label>Bisagra en el plano<NativeSelect aria-label="Bisagra de la puerta" value={value.hinge} onChange={e=>onChange({...value,hinge:e.target.value as DoorSwing['hinge']})}><NativeSelectOption value="start">{horizontal?'Izquierda':'Arriba'} · inicio</NativeSelectOption><NativeSelectOption value="end">{horizontal?'Derecha':'Abajo'} · final</NativeSelectOption></NativeSelect></label>
 <label>Sentido<NativeSelect aria-label="Sentido de apertura" value={value.direction} onChange={e=>onChange({...value,direction:e.target.value as DoorSwing['direction']})}><NativeSelectOption value="inward">Hacia dentro</NativeSelectOption><NativeSelectOption value="outward">Hacia fuera</NativeSelectOption></NativeSelect></label>
 <label>Ángulo de apertura (°)<Input aria-label="Ángulo de apertura" type="number" min={0} max={180} step={1} value={Number.isFinite(value.angleDeg)?value.angleDeg:''} onChange={e=>onChange({...value,angleDeg:e.target.value===''?NaN:Number(e.target.value)})}/></label>
 <label>Grosor de hoja (cm)<Input aria-label="Grosor de hoja" type="number" min={.5} max={20} step={.5} value={Number.isFinite(value.thicknessCm)?value.thicknessCm:''} onChange={e=>onChange({...value,thicknessCm:e.target.value===''?NaN:Number(e.target.value)})}/></label></div>
 <p className="helper">0° cerrada · 90° perpendicular · 180° abatida. Se detiene en la pared; no colisiona con muebles. Arrastra el círculo del plano o la hoja en 3D.</p></>}
 </fieldset>;
}
