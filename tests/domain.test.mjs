import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, valueCm, setManualDimensions, setEstimatedDimension, projectSchema } from '../src/domain/model.ts';
import { roomGeometry } from '../src/geometry/room.ts';
import { serializeProject, deserializeProject } from '../src/persistence/serialization.ts';

test('examples are explicitly unmeasured',()=>{
  const p=createProject(); assert.equal(p.room.dimensions.width.manualCm,null);
  assert.equal(valueCm(p.room.dimensions.width),400); assert.ok(projectSchema.safeParse(p).success);
});
test('a later visual estimate never overrides a manual measurement',()=>{
  const p=setManualDimensions(createProject(),{width:412.5,depth:310,height:255});
  const next=setEstimatedDimension(p,'width',480);
  assert.equal(valueCm(next.room.dimensions.width),412.5);
  assert.equal(next.room.dimensions.width.estimatedCm,480);
  assert.equal(p.room.dimensions.width.estimatedCm,null);
});
test('clearing a manual value restores the estimate or example explicitly',()=>{
  const p=setEstimatedDimension(createProject(),'width',440);
  const next=setManualDimensions(p,{width:null,depth:null,height:null});
  assert.equal(valueCm(next.room.dimensions.width),440);
  assert.equal(valueCm(next.room.dimensions.depth),350);
});
test('all input channels reject invalid or infinite geometry',()=>{
  for(const n of [0,-1,NaN,Infinity,2001]) assert.throws(()=>setManualDimensions(createProject(),{width:n,depth:350,height:260}));
  assert.throws(()=>setManualDimensions(createProject(),{width:400,depth:350,height:1001}));
});
test('geometry preserves exact interior dimensions and places walls outside',()=>{
  const p=setManualDimensions(createProject(),{width:412.5,depth:320,height:270});
  const g=roomGeometry(p.room); const [north,south,west,east]=g.walls;
  assert.equal(north.center.y+north.size.y/2,0);
  assert.equal(south.center.y-south.size.y/2,320);
  assert.equal(west.center.x+west.size.x/2,0);
  assert.equal(east.center.x-east.size.x/2,412.5);
  assert.equal(g.floor.center.z+g.floor.size.z/2,0);
  assert.equal(g.ceiling.center.z-g.ceiling.size.z/2,270);
  assert.equal(g.areaM2,13.2); assert.equal(g.volumeM3,35.64);
});
test('portable JSON round-trips all sources and stable IDs',()=>{
  const p=setEstimatedDimension(setManualDimensions(createProject(),{width:420,depth:333,height:240}),'width',470);
  assert.deepEqual(deserializeProject(serializeProject(p)),p);
});
test('import rejects unsupported versions, entities and unknown fields without dropping them',()=>{
  for(const change of [{schemaVersion:99},{objects:[{id:'future'}]},{photos:[{}]},{unexpected:1},{unit:'m'}]){
    assert.throws(()=>deserializeProject(JSON.stringify({...createProject(),...change})));
  }
  assert.throws(()=>deserializeProject('{broken'));
  assert.throws(()=>deserializeProject(' '.repeat(40_000_001)));
});

test('Three meshes preserve domain extents with Z-up to Y-up conversion',async()=>{
  const THREE=await import('three');
  const {createRoomGroup,disposeRoomGroup}=await import('../src/rendering/room-meshes.ts');
  const p=setManualDimensions(createProject(),{width:425,depth:315,height:245});
  const group=createRoomGroup(p.room);
  const floor=new THREE.Box3().setFromObject(group.getObjectByName('floor'));
  assert.equal(floor.max.y,0);
  assert.equal(floor.max.x,437); assert.equal(floor.max.z,327);
  const east=new THREE.Box3().setFromObject(group.getObjectByName('east'));
  assert.equal(east.min.x,425); assert.equal(east.max.y,245);
  disposeRoomGroup(group);
});
