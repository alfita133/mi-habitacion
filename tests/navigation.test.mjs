import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {doorLeaf,doorAngleAtPoint} from '../src/geometry/door-leaf.ts';
import {frameCamera} from '../src/rendering/camera-framing.ts';
import {measured as m} from '../src/domain/openings.ts';
test('mouse angle round-trips both hinges, all walls and swing directions',()=>{
 for(const wallId of ['north','south','east','west'])for(const hinge of ['start','end'])for(const direction of ['inward','outward'])for(const angleDeg of [0,15,45,90,135,180]){
 const o={id:'door',kind:'door',name:'Door',wallId,offset:m(50),width:m(90),height:m(200),sill:m(0),swing:{hinge,direction,angleDeg,thicknessCm:4}};
 assert.equal(doorAngleAtPoint(o,400,350,doorLeaf(o,400,350).end),angleDeg);
 }
});
test('initial frame includes all room corners for narrow, wide and tall rooms',()=>{
 for(const aspect of [.5,1,2.5])for(const size of [[400,260,350],[2000,1000,50],[50,1000,2000]]){
 const camera=new THREE.PerspectiveCamera(40,aspect,1,100000),target=new THREE.Vector3(),min=new THREE.Vector3(-12,-20,-12),max=new THREE.Vector3(...size);
 frameCamera(camera,target,min,max);
 for(const x of [min.x,max.x])for(const y of [min.y,max.y])for(const z of [min.z,max.z]){const p=new THREE.Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<1&&Math.abs(p.y)<1&&Math.abs(p.z)<1);}
 }
});
