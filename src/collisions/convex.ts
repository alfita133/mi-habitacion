import {cm} from '../domain/objects.ts';
import type {Solid} from '../geometry/object-parts.ts';
type V=[number,number,number];
const dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const sub=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export function support(s:Solid,d:V):V{
 const angle=s.rotationDeg*Math.PI/180,c=Math.cos(angle),sn=Math.sin(angle),x=d[0]*c+d[1]*sn,y=-d[0]*sn+d[1]*c,z=d[2];
 const a=cm(s.dimensions.width)/2,b=cm(s.dimensions.depth)/2,h=cm(s.dimensions.height)/2;
 let px:number,py:number,pz:number;
 if(s.shape==='box'){px=x>=0?a:-a;py=y>=0?b:-b;pz=z>=0?h:-h;}
 else {const length=Math.hypot(a*x,b*y,s.shape==='ellipsoid'?h*z:0);px=length?a*a*x/length:0;py=length?b*b*y/length:0;pz=s.shape==='ellipsoid'?(length?h*h*z/length:0):(z>=0?h:-h);}
 return [s.position.x+c*px-sn*py,s.position.y+sn*px+c*py,s.position.z+h+pz];
}
// Closest point of a simplex by active-set enumeration (max 4 vertices).
// Small singular subsets are skipped; their proper faces are considered separately.
function closest(points:V[]):{point:V;simplex:V[]}{
 let best=Infinity,result={point:points[0],simplex:[points[0]]};
 for(let mask=1;mask<(1<<points.length);mask++){
  const selected=points.filter((_,i)=>mask&(1<<i)),n=selected.length;if(n>4)continue;
  const matrix=Array.from({length:n+1},(_,i)=>Array.from({length:n+2},(_,j)=>j===n+1?(i===n?1:0):i===n?(j===n?0:1):j===n?1:dot(selected[i],selected[j])));
  let valid=true;
  for(let k=0;k<=n;k++){
   let pivot=k;for(let i=k+1;i<=n;i++)if(Math.abs(matrix[i][k])>Math.abs(matrix[pivot][k]))pivot=i;
   if(Math.abs(matrix[pivot][k])<1e-14){valid=false;break;}
   [matrix[k],matrix[pivot]]=[matrix[pivot],matrix[k]];const value=matrix[k][k];for(let j=k;j<=n+1;j++)matrix[k][j]/=value;
   for(let i=0;i<=n;i++)if(i!==k){const f=matrix[i][k];for(let j=k;j<=n+1;j++)matrix[i][j]-=f*matrix[k][j];}
  }
  if(!valid)continue;const weights=matrix.slice(0,n).map(row=>row[n+1]);if(weights.some(w=>w < -1e-10))continue;
  const p:V=[0,0,0];for(let i=0;i<n;i++)for(let j=0;j<3;j++)p[j]+=weights[i]*selected[i][j];const distance=dot(p,p);
  if(distance<best){best=distance;result={point:p,simplex:selected.filter((_,i)=>weights[i]>1e-10)};}
 }
 return result;
}
export function convexOverlap(a:Solid,b:Solid):boolean{
 // Work near the origin for stability even when room objects are placed far away.
 const origin=a.position,aa={...a,position:{x:0,y:0,z:0}},bb={...b,position:{x:b.position.x-origin.x,y:b.position.y-origin.y,z:b.position.z-origin.z}};
 const minkowski=(d:V):V=>{const p=sub(support(aa,d),support(bb,[-d[0],-d[1],-d[2]])),length=Math.hypot(...d);return p.map((v,i)=>v-2e-6*d[i]/length) as V;};
 let simplex=[minkowski([1,0,0])];
 for(let iteration=0;iteration<96;iteration++){
  const {point:v,simplex:active}=closest(simplex),distance=dot(v,v);if(distance<1e-18)return true;
  const p=minkowski([-v[0],-v[1],-v[2]]);
  if(distance-dot(v,p)<=1e-12*Math.max(1,distance))return false;
  simplex=[...active,p];
 }
 return false;
}
export function outsideRoom(s:Solid,w:number,d:number,h:number,epsilon=1e-6){
 for(const [axis,limit] of [[0,w],[1,d],[2,h]]){
  const direction:V=[0,0,0];direction[axis]=1;if(support(s,direction)[axis]>limit+epsilon)return true;
  direction[axis]=-1;if(support(s,direction)[axis]<-epsilon)return true;
 }
 return false;
}
