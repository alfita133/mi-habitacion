'use client';
import {memo,useEffect,useRef} from 'react';
import * as THREE from 'three';
import {SVGRenderer} from 'three/addons/renderers/SVGRenderer.js';
import type {MovableObject} from '../domain/objects.ts';
import {createObjectGroup,disposeRoomGroup} from './room-meshes.ts';
/** A rendering of saved geometry, including custom parts; never a stock product image. */
export const ObjectThumbnail=memo(function ObjectThumbnail({objects}:{objects:MovableObject[]}){
 const host=useRef<HTMLSpanElement>(null);
 const signature=JSON.stringify(objects.map(o=>({model:o.model,dimensions:o.dimensions,material:o.material,position:objects.length>1?o.position:null,rotation:objects.length>1?o.rotationDeg:0})));
 useEffect(()=>{
  const element=host.current;if(!element)return;
  const shown=objects.map(o=>({...o,hidden:false,...(objects.length===1?{position:{x:0,y:0,z:0},rotationDeg:0}:{})}));
  const group=createObjectGroup(shown),scene=new THREE.Scene();scene.add(group);
  group.traverse(o=>{if(o instanceof THREE.Mesh){const color=(o.material as THREE.MeshStandardMaterial).color;o.material.dispose();o.material=new THREE.MeshLambertMaterial({color});}});
  scene.add(new THREE.AmbientLight(0xffffff,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-200,500,300);scene.add(light);
  const box=new THREE.Box3().setFromObject(group),center=box.getCenter(new THREE.Vector3()),radius=Math.max(1,box.getSize(new THREE.Vector3()).length()/2);
  const camera=new THREE.OrthographicCamera(-radius*1.35,radius*1.35,radius,radius*-1,1,radius*12);camera.position.copy(center).add(new THREE.Vector3(1,.8,1.3).normalize().multiplyScalar(radius*5));camera.lookAt(center);
  const renderer=new SVGRenderer();renderer.setSize(180,134);renderer.setPrecision(2);renderer.render(scene,camera);renderer.domElement.setAttribute('aria-hidden','true');element.replaceChildren(renderer.domElement);disposeRoomGroup(group);
  return ()=>{element.replaceChildren();};
 // Geometry signatures avoid rerendering every thumbnail when only selection changes.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[signature]);
 return <span className="object-thumbnail" ref={host} aria-hidden="true"/>;
});
