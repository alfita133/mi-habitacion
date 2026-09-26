'use client';
import {useRef,useState,useEffect} from 'react';
import type {Project} from '../domain/model.ts';
import {emptyHistory,record,finishGesture,stepHistory} from '../domain/history.ts';
export function useEditorHistory(project:Project|null,save:(p:Project)=>void){
 const history=useRef(emptyHistory()),current=useRef(project);const [flags,setFlags]=useState({canUndo:false,canRedo:false});
 const sync=()=>setFlags({canUndo:!!history.current.past.length,canRedo:!!history.current.future.length});
 // Keep the latest loaded project without changing history on initial IndexedDB load.
 useEffect(()=>{current.current=project;},[project]);
 const update=(next:Project)=>{if(current.current)history.current=record(history.current,current.current,next);current.current=next;save(next);sync();};
 const begin=()=>{if(current.current&&!history.current.gesture)history.current={...history.current,gesture:current.current};};
 const end=()=>{if(current.current)history.current=finishGesture(history.current,current.current);sync();};
 const step=(redo=false)=>{if(!current.current)return false;history.current=finishGesture(history.current,current.current);const result=stepHistory(history.current,current.current,redo);if(!result)return false;history.current=result.history;current.current=result.project;save(result.project);sync();return true;};
 return {update,begin,end,undo:()=>step(),redo:()=>step(true),...flags};
}
