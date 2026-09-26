import {roomOutline} from '../geometry/outline.ts';
import {objectSolids} from '../geometry/object-parts.ts';
import {doorLeaf} from '../geometry/door-leaf.ts';
import * as THREE from 'three';
import {collisionWarnings} from '../collisions/objects.ts';
import {cm,type MovableObject} from '../domain/objects.ts';
import type { Room } from '../domain/model.ts';
import { roomGeometry, type Box } from '../geometry/room.ts';
export function boxMesh(box:Box, color:string): THREE.Mesh {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(box.size.x,box.size.z,box.size.y),new THREE.MeshStandardMaterial({color,roughness:.85}));
  mesh.rotation.y=-(box.rotationDeg??0)*Math.PI/180;mesh.userData.wallNormal=box.normal;mesh.userData.wallPoint=box.center;mesh.name=box.id; mesh.userData.wallId=box.wallId; mesh.position.set(box.center.x,box.center.z,box.center.y);
  mesh.castShadow=true;mesh.receiveShadow=true;
  return mesh;
}
export function createRoomGroup(room:Room,objects:MovableObject[]=[]): THREE.Group {
  const g=roomGeometry(room), group=new THREE.Group();
  if(room.shape==='polygon'){
   const shape=new THREE.Shape(g.outline.map(p=>new THREE.Vector2(p.x,-p.y)));
   for(const [id,z,color] of [['floor',0,room.floorColor],['ceiling',g.height+room.wallThicknessCm,room.wallColor]] as const){
    const geo=new THREE.ExtrudeGeometry(shape,{depth:room.wallThicknessCm,bevelEnabled:false});geo.rotateX(-Math.PI/2);geo.translate(0,z-room.wallThicknessCm,0);const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.85}));mesh.name=id;mesh.receiveShadow=true;group.add(mesh);
   }
  }else{group.add(boxMesh(g.floor,room.floorColor));group.add(boxMesh(g.ceiling,room.wallColor));}
  for(const w of g.walls) group.add(boxMesh(w,room.wallColor));
  for(const solid of g.structural){
    const mesh=boxMesh(solid,solid.kind==='glass'?'#74b5dc':'#647d98');
    mesh.userData.openingId=solid.openingId;
    if(solid.kind==='glass'){
      const material=mesh.material as THREE.MeshStandardMaterial;material.transparent=true;material.opacity=.38;mesh.castShadow=false;
    }
    group.add(mesh);
  }
  const warnings=collisionWarnings(room,objects);
  for(const opening of room.fixedElements){
    const leaf=doorLeaf(opening,g.width,g.depth,room);if(!leaf)continue;
    const mesh=boxMesh({id:`leaf-${opening.id}`,center:{x:leaf.position.x,y:leaf.position.y,z:leaf.position.z+cm(leaf.dimensions.height)/2},size:{x:cm(leaf.dimensions.width),y:cm(leaf.dimensions.depth),z:cm(leaf.dimensions.height)}},warnings.has(opening.id)?'#dc2626':'#976b29');
    mesh.rotation.y=-leaf.rotationDeg*Math.PI/180;mesh.userData.openingId=opening.id;mesh.userData.doorId=opening.id;group.add(mesh);
    // Surface decoration only: panels and handle marking do not enlarge the leaf.
    const w=cm(leaf.dimensions.width),h=cm(leaf.dimensions.height),thickness=cm(leaf.dimensions.depth),angle=leaf.rotationDeg*Math.PI/180;
    for(const face of [-1,1])for(const [index,[x,z,pw,ph]] of [[0,h*.68,w*.7,h*.42],[0,h*.22,w*.7,h*.24],[w*.35,h*.48,w*.13,h*.018]].entries()){
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshStandardMaterial({color:warnings.has(opening.id)?'#b91c1c':index===2?'#263442':'#b18a50',roughness:.85,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
      const y=face*thickness/2;panel.position.set(leaf.position.x+x*Math.cos(angle)-y*Math.sin(angle),leaf.position.z+z,leaf.position.y+x*Math.sin(angle)+y*Math.cos(angle));panel.rotation.y=-angle;panel.userData.openingId=opening.id;panel.userData.doorId=opening.id;panel.name=`door-detail-${opening.id}-${face}-${index}`;group.add(panel);
    }
  }

  for(const v of room.fixedVolumes){
    const mesh=boxMesh({id:v.id,center:{x:v.position.x,y:v.position.y,z:v.position.z+cm(v.dimensions.height)/2},size:{x:cm(v.dimensions.width),y:cm(v.dimensions.depth),z:cm(v.dimensions.height)}},warnings.has(v.id)?'#dc2626':v.color);
    mesh.rotation.y=-v.rotationDeg*Math.PI/180;mesh.userData.fixedId=v.id;group.add(mesh);
  }
  group.add(...createObjectGroup(objects,warnings).children);
  // Actual metric lines; spacing remains 25 cm at every room size.
  const vertices:number[]=[];
  for(let x=0;room.shape!=='polygon'&&x<=g.width;x+=25) vertices.push(x,.15,0,x,.15,g.depth);
  for(let y=0;room.shape!=='polygon'&&y<=g.depth;y+=25) vertices.push(0,.15,y,g.width,.15,y);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  group.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:'#7f94ad',transparent:true,opacity:.35})));
  const roof=new THREE.BufferGeometry();roof.setAttribute('position',new THREE.Float32BufferAttribute(roomOutline(room).flatMap((p,i,all)=>{const q=all[(i+1)%all.length];return [p.x,g.height,p.y,q.x,g.height,q.y];}),3));
  const outline=new THREE.LineSegments(roof,new THREE.LineBasicMaterial({color:'#8092a5',transparent:true,opacity:.45}));outline.name='ceiling-outline';group.add(outline);
  return group;
}
export function disposeRoomGroup(group:THREE.Group): void {
  group.traverse(node=>{
    if(node instanceof THREE.Mesh || node instanceof THREE.LineSegments) {
      node.geometry.dispose();
      for(const material of Array.isArray(node.material)?node.material:[node.material]) material.dispose();
    }
  });
}

/** Shared physical geometry for scene and catalog thumbnails. */
export function createObjectGroup(objects:MovableObject[],warnings:Map<string,string[]>=new Map()):THREE.Group{
 const group=new THREE.Group();
  for(const object of objects.filter(o=>!o.hidden))for(const o of objectSolids(object)){
    const mesh=boxMesh({id:o.id,center:{x:o.position.x,y:o.position.y,z:o.position.z+cm(o.dimensions.height)/2},size:{x:cm(o.dimensions.width),y:cm(o.dimensions.depth),z:cm(o.dimensions.height)}},warnings.has(o.id)?'#dc2626':object.material.color);
    if(o.shape!=='box'){mesh.geometry.dispose();mesh.geometry=o.shape==='cylinder'?new THREE.CylinderGeometry(.5,.5,1,32):new THREE.SphereGeometry(.5,24,16);mesh.scale.set(cm(o.dimensions.width),cm(o.dimensions.height),cm(o.dimensions.depth));}
    mesh.rotation.y=-o.rotationDeg*Math.PI/180;mesh.userData.objectId=o.id;group.add(mesh);
  }
 return group;
}
