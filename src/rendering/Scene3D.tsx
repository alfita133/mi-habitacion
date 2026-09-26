'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {frameCamera} from './camera-framing.ts';
import { createRenderer } from './renderer';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {doorLeaf,doorAngleAtPoint} from '../geometry/door-leaf.ts';
import { cm,footprint,type CollisionBody,type MovableObject } from '../domain/objects.ts';
import type { Room } from '../domain/model.ts';
import { roomGeometry } from '../geometry/room.ts';
import { createRoomGroup, disposeRoomGroup } from './room-meshes';

type Engine={update:(room:Room,ceiling:boolean,cutaway:boolean,objects:MovableObject[],selected:string|null)=>void;fit:()=>void};
export function Scene3D({room,onDoorAngle,onSelectFixed,onSelectOpening,objects,ceiling,cutaway,resetKey,selected,onSelect,onElevate,onGestureStart,onGestureEnd}:{onDoorAngle?:(id:string,angle:number)=>void;onSelectFixed?:(id:string)=>void;onSelectOpening?:(id:string)=>void;selected:string|null;onSelect:(id:string,multi?:boolean)=>void;onElevate:(id:string,z:number)=>void;onGestureStart:()=>void;onGestureEnd:()=>void;room:Room;objects:MovableObject[];ceiling:boolean;cutaway:boolean;resetKey:number}) {
  const host=useRef<HTMLDivElement>(null), engine=useRef<Engine|null>(null);
  const [error,setError]=useState('');
  const [handle,setHandle]=useState<{id:string;x:number;y:number;z:number;scale:number}|null>(null);
  const lift=useRef<{id:string;y:number;z:number;scale:number}|null>(null);
  const callbacks=useRef({onSelect,onDoorAngle,onSelectFixed,onSelectOpening,onElevate,onGestureStart,onGestureEnd});
  useEffect(()=>{callbacks.current={onSelect,onDoorAngle,onSelectFixed,onSelectOpening,onElevate,onGestureStart,onGestureEnd};},[onSelect,onDoorAngle,onSelectFixed,onSelectOpening,onElevate,onGestureStart,onGestureEnd]);
  function stopLift(){if(lift.current){lift.current=null;callbacks.current.onGestureEnd();}}

  const [compatible,setCompatible]=useState(false);
  useEffect(()=>{
    const element=host.current;
    if(!element) return;
    const renderer=createRenderer();
    const accelerated=renderer instanceof THREE.WebGLRenderer;
    // Result of initializing an external graphics capability, only available on mount.
    setCompatible(!accelerated);
    if(accelerated){
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    }
    renderer.setClearColor(new THREE.Color('#edf2f8'),1);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-label','Vista 3D interactiva de la habitación');
    renderer.domElement.setAttribute('role','img');
    element.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,1,100000);
    const controls=new OrbitControls(camera,renderer.domElement as unknown as HTMLElement);
    controls.maxPolarAngle=Math.PI*.49; controls.minDistance=50;controls.maxDistance=15000;
    controls.enableDamping=false; controls.screenSpacePanning=true;
    scene.add(accelerated?new THREE.HemisphereLight('#ffffff','#758aa6',2.5):new THREE.AmbientLight('#ffffff',.55));
    const sun=new THREE.DirectionalLight('#ffffff',accelerated?2.8:.45);sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=1;
    scene.add(sun,sun.target);
    let group:THREE.Group|null=null,dimensions={width:400,depth:350,height:260},showCeiling=false,open=true;
    let sceneRoom:Room|undefined;
    let sceneFixed:CollisionBody[]=[],sceneOpenings:Room["fixedElements"]=[];
    let sceneObjects:MovableObject[]=[],selection:string|null=null;
    const draw=()=>{
      if(group){
        const {width:w,depth:d}=dimensions;
        for(const child of group.children){
          if(child instanceof THREE.LineSegments) child.visible=accelerated||child.name==='ceiling-outline';
          if(child.name==='floor'&&!accelerated)child.renderOrder=-10;
          if(child.name==='ceiling') child.visible=showCeiling;
          if(child.userData.wallNormal){const n=child.userData.wallNormal,p=child.userData.wallPoint;child.visible=!open||(camera.position.x-p.x)*n.x+(camera.position.z-p.y)*n.y>=0;}

        }
      }
      renderer.render(scene,camera);
      const active=sceneObjects.find(o=>o.id===selection&&!o.hidden);
      if(active){
        const parts=sceneObjects.filter(o=>!o.hidden&&(active.groupId?o.groupId===active.groupId:o.id===active.id));
        const z=Math.min(...parts.map(o=>o.position.z)),top=Math.max(...parts.map(o=>o.position.z+cm(o.dimensions.height)));
        const v=new THREE.Vector3(active.position.x,top,active.position.y),p=v.clone().project(camera),up=v.clone().add(new THREE.Vector3(0,1,0)).project(camera),w=element.clientWidth,h=element.clientHeight;
        setHandle({id:active.id,x:Math.max(60,Math.min(w-60,(p.x+1)*w/2)),y:Math.max(25,Math.min(h-35,(1-p.y)*h/2-22)),z,scale:Math.max(.15,Math.abs(up.y-p.y)*h/2)});
      }else setHandle(null);

    };
    const fit=()=>{
      const {width:w,depth:d,height:h}=dimensions;
      const bodies=[...sceneObjects.filter(o=>!o.hidden),...sceneFixed];
      const points=bodies.flatMap(footprint),minX=Math.min(0,...points.map(p=>p.x)),maxX=Math.max(w,...points.map(p=>p.x)),minY=Math.min(0,...points.map(p=>p.y)),maxY=Math.max(d,...points.map(p=>p.y)),top=Math.max(h,...bodies.map(o=>o.position.z+cm(o.dimensions.height)));
      const bottom=Math.min(0,...bodies.map(o=>o.position.z));
      frameCamera(camera,controls.target,new THREE.Vector3(minX-12,bottom,minY-12),new THREE.Vector3(maxX+12,top,maxY+12));
      controls.update();draw();
    };
    let press:{x:number;y:number}|null=null;
    let doorDrag:{id:string;plane:THREE.Plane}|null=null;
    const rayAt=(e:PointerEvent)=>{const rect=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();scene.updateMatrixWorld(true);ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);return ray;};
    const stopDoor=()=>{if(doorDrag){doorDrag=null;controls.enabled=true;press=null;callbacks.current.onGestureEnd();}};
    const pointerDown=(event:Event)=>{const e=event as PointerEvent;element.focus({preventScroll:true});press={x:e.clientX,y:e.clientY};
      if(e.button!==0)return;
      const hit=group?rayAt(e).intersectObjects(group.children.filter(o=>o.visible),false)[0]:null;
      if(hit?.object.userData.doorId){e.preventDefault();e.stopImmediatePropagation();controls.enabled=false;doorDrag={id:hit.object.userData.doorId,plane:new THREE.Plane(new THREE.Vector3(0,1,0),-hit.point.y)};renderer.domElement.setPointerCapture(e.pointerId);callbacks.current.onGestureStart();}
    };
    const pointerMove=(event:Event)=>{if(!doorDrag)return;const e=event as PointerEvent;e.preventDefault();e.stopImmediatePropagation();const p=rayAt(e).ray.intersectPlane(doorDrag.plane,new THREE.Vector3()),o=sceneOpenings.find(o=>o.id===doorDrag!.id);if(p&&o)callbacks.current.onDoorAngle?.(o.id,doorAngleAtPoint(o,dimensions.width,dimensions.depth,{x:p.x,y:p.z},sceneRoom));};
    const finishDoor=(event:Event)=>{if(doorDrag){const e=event as PointerEvent,id=doorDrag.id,clicked=event.type==='pointerup'&&press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)<4;event.stopImmediatePropagation();stopDoor();if(clicked)callbacks.current.onSelectOpening?.(id);}};
    const keyDown=(e:KeyboardEvent)=>{if(e.ctrlKey||e.metaKey||e.altKey||e.target!==element)return;const key=e.key.toLowerCase();if(key==='home'){e.preventDefault();fit();return;}if(['arrowleft','arrowright','arrowup','arrowdown','+','-','='].includes(key)){e.preventDefault();const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);if(key==='arrowleft')spherical.theta-=.12;if(key==='arrowright')spherical.theta+=.12;if(key==='arrowup')spherical.phi=Math.max(.1,spherical.phi-.12);if(key==='arrowdown')spherical.phi=Math.min(controls.maxPolarAngle,spherical.phi+.12);if(['+','-','='].includes(key))spherical.radius=Math.max(controls.minDistance,Math.min(controls.maxDistance,spherical.radius*(key==='-'?1.1:1/1.1)));camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();draw();return;}if(!['w','a','s','d'].includes(key))return;e.preventDefault();const forward=controls.target.clone().sub(camera.position);forward.y=0;forward.normalize();const right=new THREE.Vector3(-forward.z,0,forward.x);const delta=(key==='w'||key==='s'?forward:right).multiplyScalar((key==='s'||key==='a'?-1:1)*20);camera.position.add(delta);controls.target.add(delta);controls.update();draw();};
    element.addEventListener('keydown',keyDown);
    renderer.domElement.addEventListener('pointermove',pointerMove,true);
    renderer.domElement.addEventListener('pointerup',finishDoor,true);
    renderer.domElement.addEventListener('pointercancel',finishDoor,true);
    renderer.domElement.addEventListener('lostpointercapture',stopDoor);
    const pointerUp=(event:Event)=>{const e=event as PointerEvent;if(!press||Math.hypot(e.clientX-press.x,e.clientY-press.y)>4){press=null;return;}press=null;
      const rect=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();scene.updateMatrixWorld(true);ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);
      const hit=group?ray.intersectObjects(group.children.filter(o=>o.visible),false)[0]:null;
      if(hit?.object.userData.fixedId)callbacks.current.onSelectFixed?.(hit.object.userData.fixedId);
      if(hit?.object.userData.openingId)callbacks.current.onSelectOpening?.(hit.object.userData.openingId);
      if(hit?.object.userData.objectId)callbacks.current.onSelect(hit.object.userData.objectId,e.ctrlKey||e.metaKey);
    };
    renderer.domElement.addEventListener('pointerdown',pointerDown,true);renderer.domElement.addEventListener('pointerup',pointerUp);
    controls.addEventListener('change',draw);
    const resize=()=>{const {width,height}=element.getBoundingClientRect();if(width<1||height<1)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);if(group)fit();else draw();};
    const observer=new ResizeObserver(resize);observer.observe(element);resize();
    const lost=(event:Event)=>{event.preventDefault();setError('La vista 3D ha perdido el contexto gráfico. Recarga la página para recuperarla; las medidas guardadas se conservan.');};
    renderer.domElement.addEventListener('webglcontextlost',lost);
    engine.current={fit,update:(next,roof,cut,objects,selected)=>{
      sceneRoom=next;selection=selected;sceneOpenings=next.fixedElements;
      sceneObjects=objects;
      const geometry=roomGeometry(next);
      sceneFixed=[...next.fixedVolumes,...next.fixedElements.flatMap(o=>{const leaf=doorLeaf(o,geometry.width,geometry.depth,next);return leaf?[leaf]:[];})];
      const resized=!group||geometry.width!==dimensions.width||geometry.depth!==dimensions.depth||geometry.height!==dimensions.height;
      if(group){scene.remove(group);disposeRoomGroup(group);}
      dimensions=geometry;showCeiling=roof;open=cut;
      group=createRoomGroup(next,objects);scene.add(group);
      const span=Math.max(geometry.width,geometry.depth,geometry.height);
      sun.position.set(-span,span*2,span);sun.target.position.set(geometry.width/2,0,geometry.depth/2);
      Object.assign(sun.shadow.camera,{left:-span*1.5,right:span*1.5,top:span*1.5,bottom:-span*1.5,near:1,far:span*6});
      sun.shadow.camera.updateProjectionMatrix();
      if(resized)fit();else draw();
    }};
    return ()=>{
      renderer.domElement.removeEventListener('pointerdown',pointerDown,true);renderer.domElement.removeEventListener('pointerup',pointerUp);
      stopDoor();element.removeEventListener('keydown',keyDown);
      renderer.domElement.removeEventListener('pointermove',pointerMove,true);renderer.domElement.removeEventListener('pointerup',finishDoor,true);renderer.domElement.removeEventListener('pointercancel',finishDoor,true);renderer.domElement.removeEventListener('lostpointercapture',stopDoor);
      engine.current=null;observer.disconnect();controls.removeEventListener('change',draw);controls.dispose();
      if(group)disposeRoomGroup(group);sun.shadow.dispose();
      renderer.domElement.removeEventListener('webglcontextlost',lost);
      if(accelerated){renderer.dispose();renderer.forceContextLoss();}
      renderer.domElement.remove();
    };
  },[]);
  useEffect(()=>{engine.current?.update(room,ceiling,cutaway,objects,selected);},[room,ceiling,cutaway,objects,selected]);
  useEffect(()=>{engine.current?.fit();},[resetKey]);
  return <div className="scene-wrap"><div className="scene-host" ref={host} tabIndex={0} aria-label="Navegar por la vista 3D con WASD"/>{handle&&<button className="elevation-handle" style={{left:handle.x,top:handle.y}} aria-label="Elevar objeto en 3D" title="Arrastra arriba/abajo para cambiar Z. Flechas: 5 cm." onPointerDown={e=>{e.preventDefault();e.stopPropagation();callbacks.current.onGestureStart();lift.current={id:handle.id,y:e.clientY,z:handle.z,scale:handle.scale};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const start=lift.current;if(start)callbacks.current.onElevate(start.id,Math.round(start.z+(start.y-e.clientY)/start.scale));}} onPointerUp={stopLift} onPointerCancel={stopLift} onLostPointerCapture={stopLift} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();callbacks.current.onElevate(handle.id,handle.z+(e.key==='ArrowUp'?5:-5));}}}>↕ Z {Math.round(handle.z)} cm</button>}{compatible&&<span className="renderer-mode">3D compatible · sin texturas</span>}{error&&<p className="scene-error" role="alert">{error}</p>}</div>;
}
