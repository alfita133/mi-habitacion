import type {Room} from '../domain/model.ts';
import {cm} from '../domain/objects.ts';
export type Point={x:number;y:number};
export type Vertex=Point&{id:string};
export type WallFrame={id:string;label:string;start:Point;end:Point;length:number;tangent:Point;normal:Point};
export function signedArea(p:Point[]){return p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a.x*b.y-b.x*a.y;},0)/2;}
export function cross(a:Point,b:Point,c:Point){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
export function onSegment(p:Point,a:Point,b:Point){return Math.abs(cross(a,b,p))<1e-6&&p.x>=Math.min(a.x,b.x)-1e-6&&p.x<=Math.max(a.x,b.x)+1e-6&&p.y>=Math.min(a.y,b.y)-1e-6&&p.y<=Math.max(a.y,b.y)+1e-6;}
export function segmentsMeet(a:Point,b:Point,c:Point,d:Point){return onSegment(a,c,d)||onSegment(b,c,d)||onSegment(c,a,b)||onSegment(d,a,b)||(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0);}
export function outlineIssues(p:Point[]):string[]{
 if(p.length<3||p.length>32)return ['El contorno necesita entre 3 y 32 esquinas.'];
 if(signedArea(p)<=1)return ['Dibuja el contorno en sentido horario, con área interior.'];
 for(let i=0;i<p.length;i++){
 const a=p[i],b=p[(i+1)%p.length];if(Math.hypot(b.x-a.x,b.y-a.y)<10)return ['Cada pared debe medir al menos 10 cm.'];
 const c=p[(i+2)%p.length];if(Math.abs(cross(a,b,c))<1e-6&&(b.x-a.x)*(c.x-b.x)+(b.y-a.y)*(c.y-b.y)<=0)return ['El contorno no puede volver sobre la misma pared.'];
 for(let j=i+2;j<p.length;j++){if(i===0&&j===p.length-1)continue;if(segmentsMeet(a,b,p[j],p[(j+1)%p.length]))return ['Las paredes del contorno no pueden cruzarse ni tocarse entre sí.'];}
 }
 return [];
}
export function roomOutline(room:Pick<Room,'dimensions'|'shape'|'vertices'>):Point[]{
 if(room.shape==='polygon'&&room.vertices)return room.vertices;
 const w=cm(room.dimensions.width),d=cm(room.dimensions.depth);return [{x:0,y:0},{x:w,y:0},{x:w,y:d},{x:0,y:d}];
}
export function roomWalls(room:Pick<Room,'dimensions'|'shape'|'vertices'>):WallFrame[]{
 const p=roomOutline(room);
 const frame=(id:string,label:string,start:Point,end:Point,normal?:Point):WallFrame=>{const length=Math.hypot(end.x-start.x,end.y-start.y),tangent={x:(end.x-start.x)/length,y:(end.y-start.y)/length};return {id,label,start,end,length,tangent,normal:normal??{x:-tangent.y,y:tangent.x}};};
 if(room.shape==='polygon')return p.map((v,i)=>frame(room.vertices![i].id,`Pared ${i+1}`,v,p[(i+1)%p.length]));
 return [frame('north','A · Arriba',p[0],p[1],{x:0,y:1}),frame('east','B · Derecha',p[1],p[2],{x:-1,y:0}),frame('south','C · Abajo',p[3],p[2],{x:0,y:-1}),frame('west','D · Izquierda',p[0],p[3],{x:1,y:0})];
}
export function insidePolygon(p:Point,vertices:Point[]){let inside=false;for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){const a=vertices[j],b=vertices[i];if(onSegment(p,a,b))return true;if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
export function atWall(w:WallFrame,along:number,inward=0):Point{return {x:w.start.x+w.tangent.x*along+w.normal.x*inward,y:w.start.y+w.tangent.y*along+w.normal.y*inward};}
