import test from 'node:test';import assert from 'node:assert/strict';
import {createProject,newId,upsertObject,upsertOpening,parseProject} from '../src/domain/model.ts';
import {upsertFixedVolume,removeFixedVolume} from '../src/domain/fixed-volume-operations.ts';
import {measured as m} from '../src/domain/openings.ts';
import {collisionWarnings} from '../src/collisions/objects.ts';
import {hideEntity} from '../src/domain/groups.ts';
import {createRoomGroup,disposeRoomGroup} from '../src/rendering/room-meshes.ts';
import {record,emptyHistory,stepHistory} from '../src/domain/history.ts';
const fixed=(overrides={})=>({id:newId(),name:'Pilar',color:'#64748b',position:{x:100,y:100,z:0},rotationDeg:45,dimensions:{width:m(30),depth:m(30),height:m(260)},...overrides});
const box=(overrides={})=>({...fixed(),name:'Mueble',category:'Mueble',rotationDeg:0,dimensions:{width:m(40),depth:m(40),height:m(70)},hidden:false,groupId:null,initialHeightCm:70,model:{kind:'box',source:'manual-approximation'},material:{color:'#557799',textureId:null},photoIds:[],...overrides});
const movable=(o)=>{const {color,...rest}=o;return rest;};
test('fixed volumes warn without blocking and do not enter furniture collection; hidden furniture still collides',()=>{
 const v=fixed(),o=movable(box()),p=upsertObject(upsertFixedVolume(createProject(),v),o),warnings=collisionWarnings(p.room,p.objects);assert.ok(warnings.has(v.id));assert.ok(warnings.has(o.id));assert.equal(p.objects.length,1);assert.equal(p.room.fixedVolumes.length,1);
 assert.ok(collisionWarnings(hideEntity(p,o.id,true).room,hideEntity(p,o.id,true).objects).has(v.id));
 const g=createRoomGroup(p.room,p.objects);assert.equal(g.getObjectByName(v.id).material.color.getHexString(),'dc2626');assert.equal(g.getObjectByName(v.id).userData.objectId,undefined);assert.equal(g.getObjectByName(v.id).userData.fixedId,v.id);disposeRoomGroup(g);
 assert.deepEqual(parseProject(JSON.parse(JSON.stringify(p))),p);assert.throws(()=>upsertFixedVolume(p,{...v,id:o.id}));
 const next=removeFixedVolume(p,v.id),undo=stepHistory(record(emptyHistory(),p,next),next);assert.deepEqual(undo.project,p);
});
test('fixed volume above furniture is not a collision; outside limits is an advisory',()=>{
 const v=fixed({position:{x:100,y:100,z:70},dimensions:{width:m(50),depth:m(50),height:m(20)}}),o=movable(box()),p=upsertObject(upsertFixedVolume(createProject(),v),o);assert.equal(collisionWarnings(p.room,p.objects).size,0);
 const outside=upsertFixedVolume(p,{...v,position:{x:-100,y:100,z:70}});assert.ok(collisionWarnings(outside.room,outside.objects).has(v.id));
});
test('door leaf is a visual reference even when intersecting furniture',()=>{
 const door={id:newId(),name:'Entrada',kind:'door',wallId:'north',offset:m(50),width:m(90),height:m(200),sill:m(0),swing:{hinge:'start',direction:'inward',angleDeg:90,thicknessCm:4}};
 const o=movable(box({position:{x:50,y:45,z:0},dimensions:{width:m(10),depth:m(10),height:m(70)}}));
 let p=upsertObject(upsertOpening(createProject(),door),o);assert.equal(collisionWarnings(p.room,p.objects).size,0);
 p=upsertObject(p,{...o,position:{x:90,y:40,z:0}});assert.equal(collisionWarnings(p.room,p.objects).size,0); // in arc, not on leaf
 p=upsertObject(p,{...o,position:{x:50,y:45,z:200},dimensions:{...o.dimensions,height:m(50)}});assert.equal(collisionWarnings(p.room,p.objects).size,0);
 const g=createRoomGroup(upsertObject(p,o).room,[o]);assert.notEqual(g.getObjectByName(`leaf-${door.id}`).material.color.getHexString(),'dc2626');disposeRoomGroup(g);
});
test('V7 migrates with empty fixed list and preserves configured door without mutating input',()=>{
 const old=structuredClone(createProject());old.schemaVersion=7;delete old.assets;delete old.room.fixedVolumes;const before=JSON.stringify(old);const next=parseProject(old);assert.deepEqual(next.room.fixedVolumes,[]);assert.equal(next.schemaVersion,11);assert.equal(JSON.stringify(old),before);
 assert.throws(()=>parseProject({...old,room:{...old.room,fixedVolumes:[fixed()]}}));
});
