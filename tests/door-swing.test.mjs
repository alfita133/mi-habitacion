import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject,newId,upsertOpening,parseProject,projectV6Schema} from '../src/domain/model.ts';
import {measured} from '../src/domain/openings.ts';
import {doorLeaf} from '../src/geometry/door-leaf.ts';
import {createRoomGroup,disposeRoomGroup} from '../src/rendering/room-meshes.ts';
import {serializeProject,deserializeProject} from '../src/persistence/serialization.ts';
const door=(extra={})=>({id:newId(),name:'Puerta',kind:'door',wallId:'north',width:measured(90),height:measured(200),offset:measured(50),sill:measured(0),swing:{hinge:'start',direction:'inward',angleDeg:90,thicknessCm:4},...extra});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('door endpoints follow each wall, hinge and inward/outward direction',()=>{
 for(const wallId of ['north','south','east','west'])for(const hinge of ['start','end'])for(const direction of ['inward','outward']){
 const o=door({wallId,swing:{hinge,direction,angleDeg:90,thicknessCm:4}}),l=doorLeaf(o,400,350),t=hinge==='start'?50:140,sign=direction==='inward'?1:-1;
 const expected={north:[t,90*sign],south:[t,350-90*sign],west:[90*sign,t],east:[400-90*sign,t]}[wallId];
 near(l.end.x,expected[0]);near(l.end.y,expected[1]);near(Math.hypot(l.end.x-l.hinge.x,l.end.y-l.hinge.y),90);
 const p=upsertOpening(createProject(),o),g=createRoomGroup(p.room),mesh=g.getObjectByName(`leaf-${o.id}`);
 near(mesh.position.x,l.position.x);near(mesh.position.z,l.position.y);near(mesh.position.y,100);near(mesh.rotation.y,-l.rotationDeg*Math.PI/180);
 assert.deepEqual(deserializeProject(serializeProject(p)),p);disposeRoomGroup(g);
 }
});
test('closed, fully open and manual width retain scale; invalid angles/windows rejected',()=>{
 for(const angleDeg of [0,45,180]){const o=door({swing:{hinge:'end',direction:'inward',angleDeg,thicknessCm:3},width:{defaultCm:90,estimatedCm:100,manualCm:80}}),l=doorLeaf(o,400,350);near(Math.hypot(l.end.x-l.hinge.x,l.end.y-l.hinge.y),80);assert.equal(l.dimensions.depth.manualCm,3);}
 for(const angleDeg of [-1,181,Infinity,NaN])assert.throws(()=>upsertOpening(createProject(),door({swing:{hinge:'start',direction:'inward',angleDeg,thicknessCm:4}})));
 assert.throws(()=>upsertOpening(createProject(),door({kind:'window'})));
});
test('V6 migration does not invent swing or change manual measures/identity',()=>{
 const {swing,...oldDoor}=door();const old={...createProject(),schemaVersion:6};delete old.assets;old.room.fixedElements=[oldDoor];delete old.room.fixedVolumes;projectV6Schema.parse(old);
 const migrated=parseProject(old);assert.equal(migrated.schemaVersion,11);assert.deepEqual(migrated.room,{...old.room,fixedVolumes:[]});assert.equal(doorLeaf(migrated.room.fixedElements[0],400,350),null);
 assert.throws(()=>projectV6Schema.parse({...old,room:{...old.room,fixedElements:[door()]}}));
});
