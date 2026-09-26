import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createProject,newId,upsertOpening,removeOpening,setManualDimensions,parseProject,projectSchema } from '../src/domain/model.ts';
import { measured } from '../src/domain/openings.ts';
import { roomGeometry } from '../src/geometry/room.ts';
import { deserializeProject,serializeProject } from '../src/persistence/serialization.ts';
const opening=(overrides={})=>({id:newId(),name:'Puerta',kind:'door',wallId:'north',width:measured(90),height:measured(200),offset:measured(50),sill:measured(0),...overrides});
const volume=boxes=>boxes.reduce((sum,b)=>sum+b.size.x*b.size.y*b.size.z,0);

test('legacy JSON migration keeps IDs, timestamps and all measurement sources',()=>{
 const legacy=JSON.parse(readFileSync(new URL('./fixtures/room-measured.json',import.meta.url),'utf8'));
 const next=parseProject(legacy);assert.equal(next.schemaVersion,11);const {groups,families,assets,...data}=structuredClone(next);delete data.room.fixedVolumes;assert.deepEqual({...data,schemaVersion:1},legacy);assert.deepEqual(groups,[]);
 assert.deepEqual(deserializeProject(JSON.stringify(legacy)),next);
});
test('v1 with unexpected structural data is rejected instead of silently migrated',()=>{
 const legacy=JSON.parse(readFileSync(new URL('./fixtures/room-measured.json',import.meta.url),'utf8'));
 legacy.room.fixedElements=[opening()];assert.throws(()=>parseProject(legacy));
});
test('holes subtract exact volume on all four walls and are actually empty',()=>{
 for(const wallId of ['north','south','west','east']){
  const base=createProject(),o=opening({wallId});const before=roomGeometry(base.room),after=roomGeometry(upsertOpening(base,o).room);
  assert.equal(volume(before.walls)-volume(after.walls),90*200*12);
  const point={x:wallId==='west'?-6:wallId==='east'?406:95,y:wallId==='north'?-6:wallId==='south'?356:95,z:100};
  assert.equal(after.walls.some(b=>['x','y','z'].every(k=>point[k]>b.center[k]-b.size[k]/2&&point[k]<b.center[k]+b.size[k]/2)),false);
  assert.ok(after.walls.every(b=>b.size.x>0&&b.size.y>0&&b.size.z>0));
 }
});
test('window retains sill and lintel; stacked non-overlapping apertures preserve volume',()=>{
 const base=createProject(),a=opening({kind:'window',height:measured(60),sill:measured(40)}),b=opening({name:'Superior',kind:'window',height:measured(60),sill:measured(140)});
 const p=upsertOpening(upsertOpening(base,a),b),g=roomGeometry(p.room);
 assert.equal(volume(roomGeometry(base.room).walls)-volume(g.walls),2*90*60*12);
 assert.ok(g.walls.some(b=>b.wallId==='north'&&b.center.z<40));
 assert.equal(g.structural.filter(s=>s.kind==='glass').length,2);
});
test('out-of-bounds, overlaps, duplicate IDs and elevated doors fail atomically',()=>{
 const p=upsertOpening(createProject(),opening());
 for(const o of [opening({offset:measured(350)}),opening({height:measured(300)}),opening({sill:measured(1)}),opening({offset:measured(80)})])assert.throws(()=>upsertOpening(p,o));
 assert.equal(p.room.fixedElements.length,1);
 const duplicate=structuredClone(p);duplicate.room.fixedElements.push(duplicate.room.fixedElements[0]);assert.equal(projectSchema.safeParse(duplicate).success,false);
});
test('touching boundaries allowed; structural resizing cannot invalidate existing openings',()=>{
 let p=upsertOpening(createProject(),opening({offset:measured(0)}));
 p=upsertOpening(p,opening({offset:measured(90)}));assert.equal(p.room.fixedElements.length,2);
 assert.throws(()=>setManualDimensions(p,{width:150,depth:350,height:260}));
 assert.equal(p.room.dimensions.width.manualCm,null);
});
test('manual opening measurements override estimates and editing preserves identity',()=>{
 const o=opening({width:{defaultCm:90,estimatedCm:120,manualCm:80}});
 let p=upsertOpening(createProject(),o);p=upsertOpening(p,{...o,name:'Entrada'});
 assert.equal(p.room.fixedElements.length,1);
 assert.equal(volume(roomGeometry(createProject().room).walls)-volume(roomGeometry(p.room).walls),80*200*12);
 assert.equal(p.room.fixedElements[0].width.estimatedCm,120);
 assert.deepEqual(deserializeProject(serializeProject(p)),p);
 const clean=removeOpening(p,o.id);assert.equal(clean.room.fixedElements.length,0);assert.equal(p.room.fixedElements.length,1);
});

test('a ray through the rendered doorway passes through the actual Three mesh',async()=>{
 const THREE=await import('three');
 const {createRoomGroup,disposeRoomGroup}=await import('../src/rendering/room-meshes.ts');
 const p=createProject(),solid=createRoomGroup(p.room),cut=createRoomGroup(upsertOpening(p,opening()).room);
 solid.updateMatrixWorld(true);cut.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(new THREE.Vector3(95,100,50),new THREE.Vector3(0,0,-1));
 assert.ok(ray.intersectObjects(solid.children.filter(m=>m.userData.wallId==='north')).length>0);
 assert.equal(ray.intersectObjects(cut.children.filter(m=>m.userData.wallId==='north')).length,0);
 disposeRoomGroup(solid);disposeRoomGroup(cut);
});

import {moveOpening} from '../src/domain/move-opening.ts';
test('moving structural openings preserves size and identity and changes actual wall geometry',()=>{
 const o=opening(),p=upsertOpening(createProject(),o);const moved=moveOpening(p,o.id,'east',140);const n=moved.room.fixedElements[0];
 assert.equal(n.id,o.id);assert.deepEqual(n.width,o.width);assert.deepEqual(n.height,o.height);assert.equal(n.offset.manualCm,140);assert.equal(n.wallId,'east');assert.equal(p.room.fixedElements[0].wallId,'north');
 assert.ok(roomGeometry(moved.room).structural.every(b=>b.wallId==='east'));assert.deepEqual(parseProject(JSON.parse(serializeProject(moved))),moved);
 assert.throws(()=>moveOpening(p,o.id,'north',350));assert.throws(()=>moveOpening(p,o.id,'east',10,5));
 const w=opening({name:'Ventana',kind:'window',wallId:'south',height:measured(80),sill:measured(90)}),pw=upsertOpening(p,w);
 assert.equal(moveOpening(pw,w.id,'south',100,120).room.fixedElements[1].sill.manualCm,120);
 assert.throws(()=>moveOpening(pw,w.id,'north',50,90));assert.throws(()=>moveOpening(pw,w.id,'south',50,200));
});
