import type {Project} from './model.ts';
export type History={past:Project[];future:Project[];gesture:Project|null};
export const emptyHistory=():History=>({past:[],future:[],gesture:null});
export function record(h:History,current:Project,next:Project):History {if(current===next||h.gesture)return h;return {past:[...h.past,current].slice(-100),future:[],gesture:null};}
export function finishGesture(h:History,current:Project):History {if(!h.gesture||h.gesture===current)return {...h,gesture:null};return {past:[...h.past,h.gesture].slice(-100),future:[],gesture:null};}
export function stepHistory(h:History,current:Project,redo=false){const from=redo?h.future:h.past;if(!from.length)return null;const next=from[from.length-1];return {project:next,history:redo?{past:[...h.past,current].slice(-100),future:from.slice(0,-1),gesture:null}:{past:from.slice(0,-1),future:[...h.future,current].slice(-100),gesture:null}};}
