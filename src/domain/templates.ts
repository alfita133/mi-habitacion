import {newId,type Project,upsertObject} from './model.ts';
import {type MovableObject} from './objects.ts';
import type {Part} from './parts.ts';
export const templateNames={custom:'Personalizado',desk:'Escritorio',bed:'Cama',shelf:'Estantería',fan:'Ventilador',wardrobe:'Armario',chair:'Silla',table:'Mesa'} as const;
export type Template=keyof typeof templateNames;
export function templateParts(kind:Template):Part[]{
 const part=(name:string,x:number,y:number,z:number,width:number,depth:number,height:number,shape:Part['shape']='box'):Part=>({id:newId(),name,x,y,z,width,depth,height,shape,rotationDeg:0});
 if(kind==='chair')return [part('Asiento',0,0,.45,1,1,.07),part('Respaldo',0,-.46,.52,1,.08,.48),...[-.4,.4].flatMap(x=>[-.4,.4].map(y=>part('Pata',x,y,0,.1,.1,.45)))];
 if(kind==='table')return [part('Tablero',0,0,.94,1,1,.06),...[-.43,.43].flatMap(x=>[-.43,.43].map(y=>part('Pata',x,y,0,.08,.08,.94)))];
 if(kind==='desk')return [part('Tablero',0,0,.95,1,1,.05),part('Pata izquierda',-.38,0,.04,.05,.13,.91),part('Pata derecha',.38,0,.04,.05,.13,.91),part('Pie izquierdo',-.38,0,0,.08,.8,.04),part('Pie derecho',.38,0,0,.08,.8,.04),part('Travesaño',0,0,.8,.76,.1,.08)];
 if(kind==='bed')return [part('Estructura',0,0,.22,1,1,.12),part('Colchón',0,.025,.34,.96,.95,.36),part('Cabecero',0,-.475,.22,1,.05,.78),part('Almohada',0,-.28,.7,.68,.24,.18,'ellipsoid'),...[-.42,.42].flatMap(x=>[-.4,.4].map(y=>part('Pata',x,y,0,.08,.08,.22)))];
 if(kind==='shelf')return [part('Lateral izquierdo',-.48,0,0,.04,1,1),part('Lateral derecho',.48,0,0,.04,1,1),...[0,.24,.48,.72,.96].map(z=>part('Balda',0,0,z,.92,1,.04))];
 if(kind==='wardrobe')return [part('Lateral izquierdo',-.48,0,0,.04,1,1),part('Lateral derecho',.48,0,0,.04,1,1),part('Suelo',0,0,0,.92,1,.04),part('Techo',0,0,.96,.92,1,.04),part('Fondo',0,-.48,.04,.92,.04,.92),part('Puerta izquierda',-.235,.47,.04,.46,.06,.92),part('Puerta derecha',.235,.47,.04,.46,.06,.92),part('Balda',0,0,.7,.92,.88,.025)];
 if(kind==='fan')return [part('Base',0,0,0,1,1,.05,'cylinder'),part('Soporte',0,0,.05,.09,.09,.6,'cylinder'),part('Cabezal / rejilla',0,0,.65,1,.25,.35,'ellipsoid')];
 return [part('Pieza',0,0,0,1,1,1)];
}
export function applyTemplate(project:Project,object:MovableObject,kind:Template){return upsertObject(project,{...object,model:{kind:'compound',source:'manual-approximation',parts:templateParts(kind)}});}
