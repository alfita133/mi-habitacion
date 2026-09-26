import * as THREE from 'three';
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';
/** Real perspective rendering in both modes. SVG has no textures or shadow maps. */
export function createRenderer(): THREE.WebGLRenderer | SVGRenderer {
  const canvas=document.createElement('canvas');
  try {
    const context=canvas.getContext('webgl2',{antialias:true,alpha:false});
    if(context) return new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:false});
  } catch { /* The explicit compatibility mode remains usable without GPU access. */ }
  const renderer=new SVGRenderer();renderer.setQuality('high');renderer.setPrecision(3);
  return renderer;
}
