import {type Point,type Vertex,segmentsMeet,signedArea,outlineIssues} from './outline.ts';
/** Draft geometry only: it never changes the saved room until Apply. */
export function draftPoint(p:Point,last:Point|undefined,snap:boolean,orthogonal:boolean):Point{
 let x=Math.max(0,Math.min(2000,p.x)),y=Math.max(0,Math.min(2000,p.y));
 if(snap){x=Math.round(x/5)*5;y=Math.round(y/5)*5;}
 if(last&&orthogonal){if(Math.abs(x-last.x)>Math.abs(y-last.y))y=last.y;else x=last.x;}
 return {x:Math.round(x*10)/10,y:Math.round(y*10)/10};
}
export function nextWallIssue(vertices:Vertex[],p:Point){
 if(vertices.length>=32)return 'Máximo 32 esquinas.';
 const last=vertices.at(-1);if(!last)return '';
 if(Math.hypot(p.x-last.x,p.y-last.y)<10)return 'La pared debe medir al menos 10 cm.';
 for(let i=0;i<vertices.length-2;i++)if(segmentsMeet(last,p,vertices[i],vertices[i+1]))return 'Esta pared cruza otra. Cambia su dirección.';
 return '';
}
export function closeDraft(vertices:Vertex[]){const v=signedArea(vertices)<0?[...vertices].reverse():vertices;const error=outlineIssues(v)[0];return {vertices:v,error};}
export function projectOnEdge(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return {x:a.x+t*dx,y:a.y+t*dy};}
