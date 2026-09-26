import {insidePolygon,roomOutline,type Point} from '../geometry/outline.ts';
import type {Room} from '../domain/model.ts';
import {cm} from '../domain/objects.ts';
import type {Solid} from '../geometry/object-parts.ts';
// A boundary entering a piece's open footprint is a wall penetration.
// Analytic ellipse/rectangle tests avoid polygonal inflation of round objects.
export function outsideOutline(s:Solid,room:Pick<Room,'dimensions'|'shape'|'vertices'>){
 const polygon=roomOutline(room);if(!insidePolygon(s.position,polygon))return true;
 const a=s.rotationDeg*Math.PI/180,c=Math.cos(a),sn=Math.sin(a),w=cm(s.dimensions.width)/2-1e-6,d=cm(s.dimensions.depth)/2-1e-6;
 const local=(p:Point)=>({x:((p.x-s.position.x)*c+(p.y-s.position.y)*sn)/w,y:(-(p.x-s.position.x)*sn+(p.y-s.position.y)*c)/d});
 return polygon.some((p,i)=>{
 const u=local(p),v=local(polygon[(i+1)%polygon.length]),dx=v.x-u.x,dy=v.y-u.y;
 if(s.shape!=='box'){const length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,-(u.x*dx+u.y*dy)/length)):0;return (u.x+t*dx)**2+(u.y+t*dy)**2<1;}
 let enter=0,leave=1;
 for(const [position,delta] of [[u.x,dx],[u.y,dy]]){if(Math.abs(delta)<1e-12){if(Math.abs(position)>=1)return false;}else{enter=Math.max(enter,Math.min((-1-position)/delta,(1-position)/delta));leave=Math.min(leave,Math.max((-1-position)/delta,(1-position)/delta));}}
 return enter<leave;
 });
}
