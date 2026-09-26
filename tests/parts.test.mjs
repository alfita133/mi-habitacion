import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject,newId,upsertObject,parseProject,projectV9Schema} from '../src/domain/model.ts';
import {templateParts} from '../src/domain/templates.ts';
import {objectSolids} from '../src/geometry/object-parts.ts';
import {overlaps,collisionWarnings} from '../src/collisions/objects.ts';
import {rotateEntity,joinObjects,hideEntity} from '../src/domain/groups.ts';
import {copyEntity,pasteEntity} from '../src/domain/clipboard.ts';
import {encodeBackup,decodeBackup} from '../src/persistence/backup.ts';
const m=n=>({defaultCm:n,estimatedCm:null,manualCm:n});
const box=(w=20,d=20,h=30,x=200,y=150,z=0)=>({id:newId(),name:'Test',category:'Mueble',position:{x,y,z},rotationDeg:0,dimensions:{width:m(w),depth:m(d),height:m(h)},initialHeightCm:h,model:{kind:'box',source:'manual-approximation'},hidden:false,groupId:null,material:{color:'#557799',textureId:null},photoIds:[]});
const desk=()=>({...box(160,80,80),model:{kind:'compound',source:'manual-approximation',parts:templateParts('desk')}});
test('desk free cavity, tabletop, feet, rotated and elevated pieces',()=>{
 const a=desk();assert.equal(overlaps(a,box()),false);
 assert.equal(overlaps(a,box(20,20,10,200,150,75)),true);
 assert.equal(overlaps(a,box(8,8,10,139.2,150,10)),true);
 const p=rotateEntity(upsertObject(createProject(),a),a.id,90),rot=p.objects[0];
 assert.equal(overlaps(rot,box()),false);assert.equal(overlaps(rot,box(8,8,10,200,89.2,10)),true);
 const elevated={...a,position:{...a.position,z:100}};assert.equal(overlaps(elevated,box()),false);
 const room=createProject().room;room.fixedVolumes=[{...box(),color:'#123456'}];assert.equal(collisionWarnings(room,[a]).size,0);
});
test('round base does not occupy square corners; thin support differs from head',()=>{
 const fan={...box(40,40,120),model:{kind:'compound',source:'manual-approximation',parts:templateParts('fan')}};
 assert.equal(overlaps(fan,box(2,2,2,218,168,0)),false);
 assert.equal(overlaps(fan,box(2,2,2,210,150,30)),false);
 assert.equal(overlaps(fan,box(2,2,2,200,150,30)),true);
 assert.equal(overlaps(fan,box(2,2,2,210,150,90)),true);
});
test('all templates validate, bounds and part limits reject atomically; resize measured envelope',()=>{
 for(const kind of ['custom','desk','bed','shelf','fan']){const a={...box(120,80,100),model:{kind:'compound',source:'manual-approximation',parts:templateParts(kind)}};const p=upsertObject(createProject(),a);assert.equal(p.objects[0].model.parts.length,a.model.parts.length);}
 const a=desk(),p=upsertObject(createProject(),a),bad=structuredClone(a);bad.model.parts[0].x=.5;assert.throws(()=>upsertObject(p,bad));assert.deepEqual(p.objects[0],a);
 const duplicate=structuredClone(a);duplicate.model.parts[1].id=duplicate.model.parts[0].id;assert.throws(()=>upsertObject(p,duplicate));
 const resized=upsertObject(p,{...a,dimensions:{...a.dimensions,width:m(200)}});assert.equal(objectSolids(resized.objects[0])[0].dimensions.width.manualCm,200);
});
test('legacy V9 rejects compound; V10 preserves identity clipboard groups hidden and binary backup',async()=>{
 const old={...createProject(),schemaVersion:9,objects:[box()]};projectV9Schema.parse(old);const next=parseProject(old);assert.equal(next.schemaVersion,11);assert.deepEqual(next.objects,old.objects);
 assert.throws(()=>projectV9Schema.parse({...old,objects:[desk()]}));
 const a=desk(),b=box(10,10,10,300),p=joinObjects(upsertObject(upsertObject(createProject(),a),b),[a.id,b.id],'Grupo');
 const copied=pasteEntity(p,copyEntity(p,a.id)).project;assert.deepEqual(copied.objects[2].model,a.model);
 const hidden=hideEntity(p,a.id,true);assert.equal(hidden.objects[0].hidden,true);assert.deepEqual((await decodeBackup(await encodeBackup(hidden,[]))).project,hidden);
});
test('Three emits physical parts with parent picking identity and actual scales',async()=>{
 const {createRoomGroup,disposeRoomGroup}=await import('../src/rendering/room-meshes.ts');
 const a=desk(),g=createRoomGroup(createProject().room,[a]);const meshes=g.children.filter(m=>m.userData.objectId===a.id);
 assert.equal(meshes.length,6);assert.equal(meshes[0].geometry.parameters.height,4);assert.equal(meshes[0].position.y,78);disposeRoomGroup(g);
});
