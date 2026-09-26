import test from 'node:test';import assert from 'node:assert/strict';
import {draftPoint,nextWallIssue,closeDraft,projectOnEdge} from '../src/geometry/drawing.ts';
const vertices=points=>points.map(([x,y],i)=>({id:String(i),x,y}));
test('drawing supports free precision, grid and Shift axis lock',()=>{
 assert.deepEqual(draftPoint({x:32.4,y:48.7},undefined,false,false),{x:32.4,y:48.7});
 assert.deepEqual(draftPoint({x:32.4,y:48.7},undefined,true,false),{x:30,y:50});
 assert.deepEqual(draftPoint({x:87,y:48},{x:0,y:0},true,true),{x:85,y:0});
});
test('draft rejects crossing walls and duplicate clicks; supports concave closure both directions',()=>{
 const v=vertices([[0,0],[200,0],[200,200]]);assert.ok(nextWallIssue(v,{x:200,y:200}));assert.ok(nextWallIssue(v,{x:100,y:-50}));
 const L=vertices([[0,0],[400,0],[400,150],[200,150],[200,350],[0,350]]);assert.equal(closeDraft(L).error,undefined);assert.equal(closeDraft([...L].reverse()).error,undefined);
 assert.ok(closeDraft(vertices([[0,0],[200,200],[200,0],[0,200]])).error);
});
test('inserted corner stays on diagonal wall before dragging',()=>{
 assert.deepEqual(projectOnEdge({x:60,y:40},{x:0,y:0},{x:100,y:100}),{x:50,y:50});
});
