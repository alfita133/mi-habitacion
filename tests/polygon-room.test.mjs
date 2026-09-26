import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {createProject,newId,parseProject,upsertOpening,upsertObject,projectV10Schema} from '../src/domain/model.ts';
import {setRoomOutline,initialVertices,suggestedWallMapping} from '../src/domain/room-shape.ts';
import {roomGeometry} from '../src/geometry/room.ts';
import {roomWalls} from '../src/geometry/outline.ts';
import {doorLeaf,maxDoorAngle,doorAngleAtPoint} from '../src/geometry/door-leaf.ts';
import {collisionWarnings} from '../src/collisions/objects.ts';
import {addPreset,presets} from '../src/domain/presets.ts';
import {createRoomGroup,disposeRoomGroup} from '../src/rendering/room-meshes.ts';
import {measured as m} from '../src/domain/openings.ts';
import {encodeBackup,decodeBackup} from '../src/persistence/backup.ts';
const contour=(points)=>points.map(([x,y])=>({id:newId(),x,y}));
const L=()=>setRoomOutline(createProject(),contour([[0,0],[400,0],[400,150],[200,150],[200,350],[0,350]]));
test('polygon perimeter, floor area and holes agree across domain and 3D',()=>{
 let p=L();const wall=roomWalls(p.room)[2];
 p=upsertOpening(p,{id:newId(),name:'Diagonal or reversed wall window',kind:'window',wallId:wall.id,offset:m(30),width:m(90),height:m(80),sill:m(90)});
 assert.equal(roomGeometry(p.room).areaM2,10);assert.equal(roomGeometry(p.room).volumeM3,26);
 const g=createRoomGroup(p.room),floor=g.getObjectByName('floor');const bounds=new THREE.Box3().setFromObject(floor);assert.equal(bounds.min.y,-12);assert.equal(bounds.max.y,0);assert.equal(bounds.max.x,400);assert.equal(bounds.max.z,350);
 // No geometry fills the missing lower-right corner.
 const ray=new THREE.Raycaster(new THREE.Vector3(300,200,250),new THREE.Vector3(0,-1,0));g.updateMatrixWorld(true);assert.equal(ray.intersectObject(floor).length,0);
 assert.ok(roomGeometry(p.room).structural.every(b=>b.openingId===p.room.fixedElements[0].id));disposeRoomGroup(g);
 assert.deepEqual(parseProject(JSON.parse(JSON.stringify(p))),p);
});
test('concave limits detect cut-out and crossing boundary even with centre inside',()=>{
 let p=L();let result=addPreset(p,'custom',300,250);assert.ok(collisionWarnings(result.project.room,result.project.objects).has(result.id));
 result=addPreset(p,'custom',150,200);assert.equal(collisionWarnings(result.project.room,result.project.objects).size,0);
 const o=result.project.objects[0];p=upsertObject(result.project,{...o,position:{x:195,y:145,z:0}});assert.ok(collisionWarnings(p.room,p.objects).has(o.id));
});
test('self-intersections, short walls and duplicate vertices rejected without changing original',()=>{
 const p=createProject(),before=JSON.stringify(p);for(const points of [[[0,0],[400,350],[400,0],[0,350]],[[0,0],[5,0],[400,350],[0,350]]])assert.throws(()=>setRoomOutline(p,contour(points)));assert.equal(JSON.stringify(p),before);
});
test('door stops at adjacent wall without warning against furniture',()=>{
 const o={id:newId(),name:'Puerta',kind:'door',wallId:'north',offset:m(0),width:m(90),height:m(200),sill:m(0),swing:{hinge:'start',direction:'inward',angleDeg:180,thicknessCm:4}};
 let p=upsertOpening(createProject(),o);assert.equal(maxDoorAngle(o,p.room),90);assert.equal(p.room.fixedElements[0].swing.angleDeg,90);
 const l=doorLeaf(o,400,350,p.room);assert.ok(Math.abs(l.end.x)<1e-7);assert.equal(doorAngleAtPoint(o,400,350,{x:-90,y:10},p.room),90);
 p=addPreset(p,'custom',20,50).project;assert.ok(!collisionWarnings(p.room,p.objects).has(o.id));
 const diagonal=setRoomOutline(createProject(),contour([[0,0],[400,0],[300,300],[100,300]]));const door={...o,wallId:diagonal.room.vertices[0].id};assert.ok(maxDoorAngle(door,diagonal.room)<90);assert.ok(maxDoorAngle(door,diagonal.room)>70);
});
test('preset furniture is editable and approximate; structural items remain separate',()=>{
 for(const preset of presets){const result=addPreset(createProject(),preset.key,100,100);assert.equal(result.project.objects.length,preset.kind==='movable'?1:0);assert.equal(result.project.room.fixedVolumes.length,preset.kind==='fixed'?1:0);assert.equal(result.project.room.fixedElements.length,preset.kind==='opening'?1:0);if(preset.kind==='movable')assert.equal(result.project.objects[0].dimensions.width.manualCm,null);}
});
test('V10 preserves IDs and data, V11 can carry arbitrary edges and rejects missing hosts',()=>{
 const old={...createProject(),schemaVersion:10};projectV10Schema.parse(old);assert.equal(parseProject(old).schemaVersion,11);assert.deepEqual(parseProject(old).room,old.room);
 const p=L(),v=initialVertices(p);assert.deepEqual(setRoomOutline(p,v).room,p.room);
 const legacy=addPreset(createProject(),'door',120,0).project,vertices=initialVertices(legacy),mapping=suggestedWallMapping(legacy,vertices),next=setRoomOutline(legacy,vertices,mapping);assert.equal(next.room.fixedElements[0].id,legacy.room.fixedElements[0].id);assert.equal(next.room.fixedElements[0].wallId,vertices[0].id);
 assert.throws(()=>parseProject({...next,room:{...next.room,fixedElements:[{...next.room.fixedElements[0],wallId:'missing'}]}}));
});

 test('polygon backup and history preserve contour, hosted door and preset identity',async()=>{
 const before=createProject();let p=L();p=addPreset(p,'door',100,0).project;p=addPreset(p,'desk',100,100).project;
 const restored=await decodeBackup(await encodeBackup(p,[]));assert.deepEqual(restored.project,p);
 const {emptyHistory,record,stepHistory}=await import('../src/domain/history.ts');
 const undo=stepHistory(record(emptyHistory(),before,p),p);assert.deepEqual(undo.project,before);
 assert.deepEqual(stepHistory(undo.history,undo.project,true).project,p);
 });
