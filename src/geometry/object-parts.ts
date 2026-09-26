import {cm,type CollisionBody,type MovableObject} from '../domain/objects.ts';
export type Solid=CollisionBody&{shape:'box'|'cylinder'|'ellipsoid';partId:string};
const measure=(n:number)=>({defaultCm:n,manualCm:n,estimatedCm:null});
export function objectSolids(o:CollisionBody & {model?:MovableObject['model']}):Solid[]{
 if(o.model?.kind!=='compound')return [{...o,shape:'box',partId:o.id}];
 const w=cm(o.dimensions.width),d=cm(o.dimensions.depth),h=cm(o.dimensions.height),a=o.rotationDeg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 return o.model.parts.map(p=>({...o,partId:p.id,shape:p.shape,position:{x:o.position.x+p.x*w*c-p.y*d*s,y:o.position.y+p.x*w*s+p.y*d*c,z:o.position.z+p.z*h},rotationDeg:(o.rotationDeg+p.rotationDeg)%360,dimensions:{width:measure(p.width*w),depth:measure(p.depth*d),height:measure(p.height*h)}}));
}
// Polygonal footprint for drawing and box SAT. Curved physics uses analytic
// support in collisions/convex.ts, not this polygon or a vertical prism.
export function solidFootprint(o:Solid,conservative=true){
 const w=cm(o.dimensions.width)/2,d=cm(o.dimensions.depth)/2,a=o.rotationDeg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 const factor=conservative?1/Math.cos(Math.PI/32):1;
 const points=o.shape==='box'?[[-w,-d],[w,-d],[w,d],[-w,d]]:Array.from({length:32},(_,i)=>[Math.cos(i*Math.PI/16)*w*factor,Math.sin(i*Math.PI/16)*d*factor]);
 return points.map(([x,y])=>({x:o.position.x+x*c-y*s,y:o.position.y+x*s+y*c}));
}
