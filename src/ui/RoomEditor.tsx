'use client';
import {PresetLibrary} from './PresetLibrary';
import {RoomShapeEditor} from './RoomShapeEditor';
import {addPreset} from '../domain/presets.ts';
import {upsertFixedVolume} from '../domain/fixed-volume-operations.ts';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem} from '@/components/ui/dropdown-menu';
import { useRef,useState,useEffect } from 'react';
import {FixedVolumesPanel} from './FixedVolumesPanel';
import { Plus, MoreHorizontal, Undo2, Redo2, Box, Download, Upload, Maximize2, Minimize2, Grid2X2, RotateCcw, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction } from '@/components/ui/alert-dialog';
import { Plan2D } from '../rendering/Plan2D';
import { Scene3D } from '../rendering/Scene3D';
import { ObjectsPanel } from './ObjectsPanel';
import {copyEntity,pasteEntity,type ObjectClipboard} from '../domain/clipboard.ts';
import {useEditorHistory} from './useEditorHistory';
import {deleteEntity,entityBounds} from '../domain/groups.ts';
import {entitySelection,translateSelection} from '../domain/selection.ts';
import { CoordinateGuide } from './CoordinateGuide';
import { collisionWarnings } from '../collisions/objects.ts';
import { upsertOpening,validationMessage } from '../domain/model.ts';
import { StructurePanel } from './StructurePanel';
import { MeasurementsForm } from './MeasurementsForm';
import { useProject } from './useProject';
import {FamiliesPanel} from '../revit/FamiliesPanel';
import {BindingEditor} from '../revit/BindingEditor';
import {OpeningPosition} from './OpeningPosition';
import {moveOpening} from '../domain/move-opening.ts';
import {RoomsDialog} from './RoomsDialog';
import {members,joinObjects,hideEntity} from '../domain/groups.ts';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import { effectiveDimensions, DIMENSION_KEYS, type Project } from '../domain/model.ts';
import {encodeBackup,readBackupFile,type PreparedBackup} from '../persistence/backup.ts';
import {readProjectAssets} from '../persistence/database.ts';
export function RoomEditor(){
 const state=useProject();
 if(!state.project||!state.collection)return <main className="loading"><Box/><h1>Mis habitaciones</h1><p role={state.storageError?'alert':'status'}>{state.storageMessage}</p></main>;
 return <div aria-busy={state.busy}>{state.busy&&<p className="notice" role="status">Abriendo copia completa…</p>}<div inert={state.busy}><RoomSession key={state.project.id} project={state.project} saveProject={state.setProject} storageMessage={state.storageMessage} storageError={state.storageError} roomsControl={<RoomsDialog collection={state.collection} onChange={state.update}/>} importRoom={state.importBackup}/></div></div>;
}
function RoomSession({project,saveProject,storageMessage,storageError,roomsControl,importRoom}:{project:Project;saveProject:(p:Project)=>void;storageMessage:string;storageError:boolean;roomsControl:React.ReactNode;importRoom:(p:PreparedBackup)=>Promise<void>}){
 const [view,setView]=useState<'both'|'plan'|'scene'>('both'),[panel,setPanel]=useState(false),[roomSettings,setRoomSettings]=useState(false);
 const [library,setLibrary]=useState(false),[mobileTab,setMobileTab]=useState<'plan'|'scene'|'objects'>('plan'),[narrow,setNarrow]=useState(false);
 useEffect(()=>{const m=window.matchMedia('(max-width: 760px)');const change=()=>setNarrow(m.matches);change();m.addEventListener('change',change);return ()=>m.removeEventListener('change',change);},[]);
 const [help,setHelp]=useState(false),[files,setFiles]=useState(false);
 const [chosen,setChosen]=useState<string[]>([]);
 const [fixedId,setFixedId]=useState<string|null|undefined>(undefined);
 const [openingId,setOpeningId]=useState<string|null>(null);
 function selectOpening(id:string){setLibrary(false);setOpeningId(id);setSelected(null);setChosen([]);setMoveError('');}
 const inspector=useRef<HTMLElement>(null);

 function select(id:string|null,multi=false){if(id){setLibrary(false);setPanel(false);}setOpeningId(null);if(!id){setSelected(null);setChosen([]);return;}id=members(project,id)[0]?.id??id;const ids=multi?(chosen.includes(id)?chosen.filter(v=>v!==id):[...chosen,id]):[id];setSelected(ids.at(-1)??null);setChosen(ids);}
 const selection=entitySelection(project,chosen);
 function moveSelection(id:string,dx:number,dy:number,dz=0){return translateSelection(project,selection.some(key=>members(project,key).some(o=>o.id===id))?selection:[id],dx,dy,dz);}
 function hideSelection(){let next=project;for(const id of selection)next=hideEntity(next,id,true);setProject(next);select(null);}
  const [ceiling,setCeiling]=useState(false),[cutaway,setCutaway]=useState(true),[resetKey,setResetKey]=useState(0);
  const [pendingImport,setPendingImport]=useState<PreparedBackup|null>(null),[message,setMessage]=useState(''),[formVersion,setFormVersion]=useState(0);
  const [selected,setSelected]=useState<string|null>(null),[moveError,setMoveError]=useState('');
  const history=useEditorHistory(project,saveProject),setProject=history.update;
  function setDoorAngle(id:string,angle:number){const o=project.room.fixedElements.find(o=>o.id===id);if(o?.swing)setProject(upsertOpening(project,{...o,swing:{...o.swing,angleDeg:angle}}));}
  function placePreset(key:string,x=d.width/2,y=d.depth/2){try{const result=addPreset(project,key,x,y);setProject(result.project);setLibrary(false);if(result.kind==='movable')select(result.id);else if(result.kind==='opening')selectOpening(result.id);else {setFixedId(result.id);if(narrow)setMobileTab('plan');}setMessage('');}catch(e){setMessage(validationMessage(e));}}
  const clipboard=useRef<ObjectClipboard[]|null>(null),pasteCount=useRef(0);
  function command(action:'copy'|'cut'|'paste'|'undo'|'redo'){
    if(!project)return;
    try{
      if(action==='undo'||action==='redo'){if(history[action]()){setFormVersion(v=>v+1);setMessage(action==='undo'?'Cambio deshecho.':'Cambio rehecho.');}return;}
      if(action==='paste'){if(!clipboard.current)return;let next=project;const ids:string[]=[];for(const clip of clipboard.current){const pasted=pasteEntity(next,clip,10*(pasteCount.current+1));next=pasted.project;ids.push(pasted.selected);}setProject(next);onPaste(ids);pasteCount.current++;return;}
      if(!selected)return;const ids=selection.length?selection:[selected];const copied=ids.map(id=>copyEntity(project,id)).filter((c):c is ObjectClipboard=>c!==null);if(!copied.length)return;clipboard.current=copied;pasteCount.current=0;
      if(action==='cut'){setProject(ids.reduce((p,id)=>deleteEntity(p,id),project));select(null);}
      setMessage(action==='copy'?'Objeto copiado. Usa Ctrl+V para pegar.':'Objeto cortado. Usa Ctrl+V para pegar.');
    }catch(e){setMessage(validationMessage(e));}
  }
  function onPaste(ids:string[]){setSelected(ids.at(-1)??null);setChosen(ids);setMessage('Selección pegada.');}
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{if(!(e.ctrlKey||e.metaKey)||e.altKey||e.repeat)return;const target=e.target as HTMLElement;
      if(target.closest('input,textarea,select,[contenteditable="true"],[role="textbox"],[role="slider"]')||document.querySelector('[role="dialog"],[role="alertdialog"]'))return;
      const action=({c:'copy',x:'cut',v:'paste',z:e.shiftKey?'redo':'undo',y:'redo'} as const)[e.key.toLowerCase() as 'c'|'x'|'v'|'z'|'y'];
      if(action){e.preventDefault();command(action);}
     };
    const clipEvent=(e:ClipboardEvent)=>{
      const target=e.target instanceof Element?e.target:null;
      if(target?.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]')||document.querySelector('[role="dialog"],[role="alertdialog"]'))return;
      if(e.type==='paste'){if(clipboard.current){e.preventDefault();command('paste');}return;}
      if(!selected||!project?.objects.some(o=>o.id===selected))return;
      e.preventDefault();e.clipboardData?.setData('text/plain',project.objects.find(o=>o.id===selected)!.name);command(e.type==='cut'?'cut':'copy');
    };
    window.addEventListener('keydown',key);for(const name of ['copy','cut','paste'])window.addEventListener(name,clipEvent as EventListener);
    return ()=>{window.removeEventListener('keydown',key);for(const name of ['copy','cut','paste'])window.removeEventListener(name,clipEvent as EventListener);};
  });
  const file=useRef<HTMLInputElement>(null);
  const [fileBusy,setFileBusy]=useState(false);
  const [backupUrl,setBackupUrl]=useState<string|null>(null);
  useEffect(()=>()=>{if(backupUrl)URL.revokeObjectURL(backupUrl);},[backupUrl]);
  async function exportCopy(){setFileBusy(true);try{const blob=await encodeBackup(project,await readProjectAssets(project));setBackupUrl(URL.createObjectURL(blob));setMessage('Copia completa preparada. Pulsa Descargar copia para guardarla en tu equipo.');}catch(e){setMessage(validationMessage(e));}finally{setFileBusy(false);}}
  async function applyImport(){if(!pendingImport)return;setFileBusy(true);try{await importRoom(pendingImport);setPendingImport(null);}catch(e){setMessage(validationMessage(e));}finally{setFileBusy(false);}}
  if(!project)return <main className="loading"><Box/><h1>Mi habitación</h1><p role="status">Abriendo el proyecto guardado…</p></main>;
  const d=effectiveDimensions(project.room);
  const warnings=collisionWarnings(project.room,project.objects);
  const manualCount=DIMENSION_KEYS.filter(k=>project.room.dimensions[k].manualCm!==null).length;
  async function readFile(event:React.ChangeEvent<HTMLInputElement>){
    const selected=event.target.files?.[0];event.target.value='';if(!selected)return;setFiles(false);
    setFileBusy(true);try {setPendingImport(await readBackupFile(selected));setMessage('');}
    catch(error){setMessage(error instanceof Error?error.message:'No se pudo abrir el archivo.');}finally{setFileBusy(false);}
  }
  return <main className={`editor-app mobile-${mobileTab}`} >
    <header className="app-header">
      <div className="brand"><div className="brand-icon"><Box size={24}/></div><div><h1>{project.name}</h1></div></div>
      <div className="file-actions">{roomsControl}<div className="history-tools" role="group" aria-label="Historial"><Button variant="ghost" size="icon" aria-label="Deshacer" title="Deshacer · Ctrl+Z" disabled={!history.canUndo} onClick={()=>command('undo')}><Undo2/></Button><Button variant="ghost" size="icon" aria-label="Rehacer" title="Rehacer · Ctrl+Y" disabled={!history.canRedo} onClick={()=>command('redo')}><Redo2/></Button></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Más acciones"><MoreHorizontal/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>setFiles(true)}>Archivo</DropdownMenuItem><DropdownMenuItem onSelect={()=>setHelp(true)}>Ayuda</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
      <input ref={file} type="file" accept=".json,.pack,application/json,application/octet-stream" onChange={readFile} hidden aria-label="Archivo del proyecto"/>
    </header>
    <div className="project-bar"><div><strong>{d.width} × {d.depth} × {d.height} <span>cm</span></strong></div><div className="save-state" role="status">{storageError?<Info size={16}/>:<Check size={16}/>}<span>{narrow&&storageMessage==='Guardado en este navegador'?'Guardado':storageMessage}</span></div></div>
    {backupUrl&&<div className="notice"><a href={backupUrl} download="mi-habitacion.habitacion.pack" className="underline font-semibold">Descargar copia</a><span> · Habitación, originales Revit y archivos asociados al momento de exportar.</span><Button size="sm" variant="ghost" onClick={()=>setBackupUrl(null)}>Cerrar descarga</Button></div>}
    {message&&<div className="notice" role="status">{message}<Button size="sm" variant="ghost" onClick={()=>setMessage('')}>Cerrar</Button></div>}
    <div className={`editor-layout visual-editor ${(library||panel||selected||openingId)?'with-inspector':''}`}>

      <section className="workspace" aria-label="Vistas de la habitación">
        {manualCount<3?<div className="measurement-note"><Info size={18}/><p>Medidas por confirmar</p></div>:null}
        <div className="workspace-tools"><Button className="primary-add" onClick={()=>{setLibrary(!library);setPanel(false);select(null);setOpeningId(null);if(narrow)setMobileTab('objects');}} aria-expanded={library}><Plus/> Añadir objeto</Button><Button variant="ghost" onClick={()=>{setPanel(!panel);setLibrary(false);select(null);if(narrow)setMobileTab('objects');}} aria-expanded={panel}>Objetos ({project.objects.length})</Button><RoomShapeEditor project={project} onChange={setProject}/><Button variant="ghost" onClick={()=>setRoomSettings(true)}>Medidas</Button><details className="advanced-tools"><summary aria-label="Herramientas de estructura y Revit">Más</summary><div><FixedVolumesPanel project={project} onChange={setProject} editingId={fixedId} onEdit={setFixedId}/><FamiliesPanel project={project} onChange={setProject} onAdded={(id,structural)=>structural?selectOpening(id):select(id)}/></div></details></div>
        <nav className="mobile-view-tabs" aria-label="Vista activa">{(['plan','scene','objects'] as const).map(tab=><Button key={tab} variant={mobileTab===tab?'secondary':'ghost'} aria-pressed={mobileTab===tab} onClick={()=>{setMobileTab(tab);if(tab==='objects'&&!library)setPanel(true);}}>{{plan:'Plano 2D',scene:'Vista 3D',objects:'Objetos'}[tab]}</Button>)}</nav>
        <div className={`view-grid focus-${view}`}>

          <section className="view-card plan-card" aria-labelledby="plan-title"><div className="view-header"><h2 id="plan-title"><Grid2X2 size={18}/> Plano 2D</h2><Button size="sm" variant="ghost" aria-label={view==='plan'?'Ver ambas vistas':'Ampliar plano 2D'} onClick={()=>setView(view==='plan'?'both':'plan')}>{view==='plan'?<Minimize2/>:<Maximize2/>}</Button></div><div className="plan-body"><Plan2D onDropPreset={placePreset} onMoveFixed={(id,x,y)=>{try{const v=project.room.fixedVolumes.find(v=>v.id===id);if(v)setProject(upsertFixedVolume(project,{...v,position:{...v.position,x,y}}));}catch(e){setMoveError(validationMessage(e));}}} onDoorAngle={setDoorAngle} onSelectFixed={setFixedId} selectedOpening={openingId} onSelectOpening={selectOpening} onMoveOpening={(id,offset)=>{try{const o=project.room.fixedElements.find(o=>o.id===id);if(!o)return false;setProject(moveOpening(project,id,o.wallId,offset));setMoveError('');return true;}catch(e){setMoveError(validationMessage(e));return false;}}} onGestureStart={history.begin} onGestureEnd={history.end} selectedIds={selection.flatMap(id=>members(project,id).map(o=>o.id))} warnings={warnings} room={project.room} objects={project.objects} selected={selected} onSelect={select} onMove={(id,x,y)=>{try{const o=project.objects.find(o=>o.id===id);if(!o)return false;setProject(moveSelection(id,x-o.position.x,y-o.position.y));setMoveError('');return true;}catch(e){setMoveError(validationMessage(e));return false;}}}/></div>{moveError&&<p role="alert" className="error-message">{moveError}</p>}<footer className="view-footer"><span className="grid-symbol"/> Cuadrícula: 25 cm · ajuste: 5 cm <span className="footer-right">Medidas interiores</span></footer></section>
          <section className="view-card scene-card" aria-labelledby="scene-title"><div className="view-header"><h2 id="scene-title"><Box size={18}/> Vista 3D</h2><Button variant="ghost" size="sm" onClick={()=>setResetKey(v=>v+1)}><RotateCcw size={15}/> Centrar</Button><Button size="sm" variant="ghost" aria-label={view==='scene'?'Ver ambas vistas':'Ampliar vista 3D'} onClick={()=>setView(view==='scene'?'both':'scene')}>{view==='scene'?<Minimize2/>:<Maximize2/>}</Button></div><Scene3D onDoorAngle={setDoorAngle} onSelectFixed={setFixedId} onSelectOpening={selectOpening} selected={selected} onSelect={select} onGestureStart={history.begin} onGestureEnd={history.end} onElevate={(id,z)=>{try{const b=entityBounds(project,id);setProject(moveSelection(id,0,0,z-b.z));}catch(e){setMessage(validationMessage(e));}}} objects={project.objects} room={project.room} ceiling={ceiling} cutaway={cutaway} resetKey={resetKey}/><footer className="view-footer"><span>Arrastrar: orbitar · rueda: zoom · WASD: mover</span></footer></section>
        </div>
        {warnings.size>0&&<p className="collision-summary" role="status">{warnings.size} elemento(s) en rojo: colisión o fuera de límites. Puedes colocarlos igualmente.</p>}
        <div className="view-options"><div><label htmlFor="cutaway">Interior: {cutaway?'visible':'cerrado'}</label><Switch id="cutaway" checked={cutaway} onCheckedChange={setCutaway}/></div><div><label htmlFor="ceiling">Techo: {ceiling?'visible':'oculto'}</label><Switch id="ceiling" checked={ceiling} onCheckedChange={setCeiling}/></div><Button variant="ghost" size="sm" onClick={()=>command('paste')}>Pegar</Button></div>

      </section>
      {library?<PresetLibrary onPlace={placePreset} onAdd={key=>placePreset(key)} onClose={()=>{setLibrary(false);if(narrow)setPanel(true);}}/>:(panel||selected||openingId||mobileTab==='objects')&&<aside ref={inspector} className="properties-panel contextual-panel" aria-label="Editar selección"><div className="panel-label">{selected||openingId?<Button variant="ghost" onClick={()=>{select(null);setOpeningId(null);setPanel(true);}}>← Mis objetos</Button>:'Mis objetos'}<Button size="sm" variant="ghost" onClick={()=>{setPanel(false);select(null);setOpeningId(null);setMobileTab('plan');}}>Cerrar</Button></div>
      {openingId?<OpeningPosition key={`${openingId}-${project.updatedAt}`} project={project} id={openingId} onChange={setProject} onClose={()=>setOpeningId(null)}/>:<>
      {selected&&<div className="selection-actions" role="group" aria-label="Acciones de selección"><Button variant="outline" size="sm" onClick={hideSelection}>Ocultar</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" aria-label="Más acciones de selección"><MoreHorizontal/></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={()=>command('copy')}>Copiar</DropdownMenuItem><DropdownMenuItem onSelect={()=>command('cut')}>Cortar</DropdownMenuItem><DropdownMenuItem onSelect={()=>select(null)}>Deseleccionar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>}
      <ObjectsPanel project={project} selected={selected} onSelect={select} onChange={setProject} checked={selection} onChecked={ids=>{setChosen(ids);setSelected(null);}} showList={panel||(!selected&&mobileTab==='objects')}/></>}
      {(selected||openingId)&&<BindingEditor key={`${selected??openingId}-${formVersion}`} project={project} id={(selected??openingId)!} onChange={setProject}/>}</aside>}

    </div>
    <Dialog open={roomSettings} onOpenChange={setRoomSettings}><DialogContent className="opening-dialog"><DialogTitle>Editar habitación</DialogTitle><DialogDescription>Medidas interiores y elementos estructurales fijos.</DialogDescription><MeasurementsForm key={`measurements-${formVersion}`} project={project} onChange={p=>{setProject(p);setFormVersion(v=>v+1);}}/><StructurePanel key={`structure-${formVersion}`} project={project} onChange={setProject}/></DialogContent></Dialog>
    <Dialog open={files} onOpenChange={setFiles}><DialogContent><DialogTitle>Archivo</DialogTitle><DialogDescription>El guardado es automático en este navegador. Usa una copia para guardar tus datos fuera de él.</DialogDescription><Button variant="outline" disabled={fileBusy} onClick={()=>file.current?.click()}><Upload/> Abrir copia</Button><Button variant="outline" disabled={fileBusy} onClick={()=>{void exportCopy();setFiles(false);}}><Download/> Exportar copia</Button></DialogContent></Dialog>
    <Dialog open={help} onOpenChange={setHelp}><DialogContent><DialogTitle>Cómo usar el editor</DialogTitle><DialogDescription>Selecciona un objeto para ver sus opciones. Tus medidas reales tienen prioridad.</DialogDescription><ul className="editor-help"><li>Plano: arrastra los objetos o usa sus flechas de teclado para moverlos 5 cm. Ctrl + clic selecciona varios. También puedes escribir sus coordenadas en el panel.</li><li>Puertas: arrastra el círculo del plano o la hoja en 3D para abrir y cerrar. Su apertura se detiene en la pared. Es una referencia sin colisiones con muebles.</li><li>3D: arrastra el fondo para orbitar, usa la rueda para zoom y pulsa WASD para desplazarte tras hacer clic en la vista. Flechas: orbitar; +/−: zoom; Inicio: centrar. Centrar recupera el encuadre completo.</li><li>Altura: selecciona un objeto y arrastra su control ↕ Z.</li><li>Ctrl+C / X / V: copiar, cortar y pegar. Ctrl+Z / Y: deshacer y rehacer.</li><li>Los objetos en rojo se guardan igualmente. El historial y el portapapeles se reinician al cambiar de habitación.</li></ul><CoordinateGuide room={project.room}/></DialogContent></Dialog>

    <AlertDialog open={!!pendingImport} onOpenChange={open=>{if(!open)setPendingImport(null);}}><AlertDialogContent><AlertDialogTitle>¿Abrir esta habitación?</AlertDialogTitle><AlertDialogDescription>Se añadirá como otra habitación guardada. La habitación actual se conserva.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction disabled={fileBusy} onClick={e=>{e.preventDefault();void applyImport();}}>Abrir habitación</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </main>;
}
