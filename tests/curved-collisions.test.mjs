import test from 'node:test';
import assert from 'node:assert/strict';
import {newId,createProject,upsertObject,parseProject} from '../src/domain/model.ts';
import {overlaps,objectIssues} from '../src/collisions/objects.ts';
import {templateParts} from '../src/domain/templates.ts';
const m=n=>({defaultCm:n,manualCm:n,estimatedCm:null});
const shape=(kind,x,y,z,w=40,d=40,h=40)=>({id:newId(),name:kind,category:'QA',hidden:false,groupId:null,initialHeightCm:h,position:{x,y,z},rotationDeg:0,dimensions:{width:m(w),depth:m(d),height:m(h)},material:{color:'#557799',textureId:null},photoIds:[],model:kind==='box'?{kind:'box',source:'manual-approximation'}:{kind:'compound',source:'manual-approximation',parts:[{id:newId(),name:'Pieza',shape:kind,x:0,y:0,z:0,width:1,depth:1,height:1,rotationDeg:0}]}});
test('round base touching wall is not outside; actual penetration is',()=>{
 const room=createProject().room,a=shape('cylinder',20,100,0,40,40,4);
 assert.equal(objectIssues(room,[a]).length,0);a.position.x=19.99;assert.equal(objectIssues(room,[a]).length,1);
});
test('ellipsoid vertical corners are empty, not an elliptic prism',()=>{
 const ball=shape('ellipsoid',100,100,80);
 assert.equal(overlaps(ball,shape('box',118,100,115,2,2,2)),false);
 assert.equal(overlaps(ball,shape('box',118,100,99,2,2,2)),true);
 assert.equal(overlaps(ball,shape('box',100,100,120,10,10,5)),false);
 assert.equal(overlaps(ball,shape('box',100,100,119.9,10,10,5)),true);
});
test('sphere-box grid agrees with analytic closest-point distance; symmetry',()=>{
 const ball=shape('ellipsoid',100,100,80);
 for(let x=0;x<=30;x+=3)for(let z=0;z<=30;z+=3){
  const b=shape('box',100+x,100,98+z,4,4,4),distance=Math.hypot(Math.max(0,x-2),Math.max(0,z-2));
  const expected=distance<20-1e-5;assert.equal(overlaps(ball,b),expected,`x=${x}, z=${z}`);assert.equal(overlaps(b,ball),expected);
 }
});
test('sphere-sphere and cylinders allow contact, rotations preserve circular base',()=>{
 const a=shape('ellipsoid',100,100,0),b=shape('ellipsoid',140,100,0);assert.equal(overlaps(a,b),false);b.position.x=139.99;assert.equal(overlaps(a,b),true);
 const c=shape('cylinder',100,100,0);c.rotationDeg=37;assert.equal(overlaps(c,shape('cylinder',140,100,0)),false);assert.equal(overlaps(c,shape('cylinder',139.9,100,0)),true);
});
test('wardrobe pieces preserve closed doors and empty cavity in stored V10',()=>{
 const a={...shape('box',150,150,0,120,60,220),model:{kind:'compound',source:'manual-approximation',parts:templateParts('wardrobe')}};
 const p=upsertObject(createProject(),a);assert.equal(p.objects[0].model.parts.length,8);assert.deepEqual(parseProject(JSON.parse(JSON.stringify(p))),p);
 assert.equal(overlaps(a,shape('box',150,150,50,20,20,20)),false);assert.equal(overlaps(a,shape('box',150,178,50,20,4,20)),true);
});
test('door decoration and window mullion retain structural identity and metric bounds',async()=>{
 const {openingSolids}=await import('../src/geometry/openings.ts');
 const {createRoomGroup,disposeRoomGroup}=await import('../src/rendering/room-meshes.ts');
 const window={id:newId(),name:'Ventana',kind:'window',wallId:'north',width:m(120),height:m(100),offset:m(150),sill:m(90)};
 const solids=openingSolids(window,400,350,12),mullion=solids.find(s=>s.id.endsWith('mullion'));assert.ok(mullion);assert.equal(mullion.center.x,210);assert.equal(mullion.openingId,window.id);
 const p=createProject();p.room.fixedElements=[{...window,id:newId(),name:'Puerta',kind:'door',offset:m(0),width:m(90),height:m(210),sill:m(0),swing:{hinge:'start',direction:'inward',angleDeg:60,thicknessCm:4}}];
 const group=createRoomGroup(p.room),details=group.children.filter(n=>n.name.startsWith('door-detail-'));assert.equal(details.length,6);assert.ok(details.every(n=>n.userData.openingId===p.room.fixedElements[0].id));disposeRoomGroup(group);
});
