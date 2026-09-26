import * as THREE from 'three';
/** Fit a bounding sphere inside both frustum axes, including portrait panes. */
export function frameCamera(camera:THREE.PerspectiveCamera,target:THREE.Vector3,min:THREE.Vector3,max:THREE.Vector3){
 const center=min.clone().add(max).multiplyScalar(.5),radius=max.clone().sub(min).length()/2;
 const vertical=camera.fov*Math.PI/360,horizontal=Math.atan(Math.tan(vertical)*camera.aspect);
 const distance=radius/Math.sin(Math.min(vertical,horizontal))*1.08;
 target.copy(center);camera.position.copy(center).add(new THREE.Vector3(.65,1.05,1).normalize().multiplyScalar(distance));
 camera.lookAt(target);camera.updateMatrixWorld();
}
