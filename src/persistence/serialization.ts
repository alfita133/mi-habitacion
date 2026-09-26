import {z} from 'zod';
import { projectSchema, parseProject, type Project } from '../domain/model.ts';
export function serializeProject(project: Project): string {
  return JSON.stringify(projectSchema.parse(project), null, 2);
}
export function deserializeProject(text: string): Project {
  if (text.length > 40_000_000) throw new Error('El archivo supera el límite de 40 MB para esta versión.');
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error('El archivo no contiene un JSON válido.'); }
  try { if(typeof data==='object'&&data!==null&&'format' in data){const envelope=z.object({format:z.literal('habitacion.revit-project'),version:z.literal(1),coordinateSystem:z.literal('cm-x-right-y-down-z-up-centerXY-baseZ'),project:z.unknown(),roomDimensionsCm:z.object({width:z.number(),depth:z.number(),height:z.number()}).strict()}).strict().parse(data);return parseProject(envelope.project);} return parseProject(data); }
  catch { throw new Error('Proyecto incompatible o inválido. Revisa la versión, las medidas y los huecos de las paredes. No se ha cambiado tu habitación.'); }
}
export function downloadProject(project: Project): void {
  if(project.assets.length)throw new Error('Usa Exportar copia para incluir los archivos asociados.');
  const url = URL.createObjectURL(new Blob([serializeProject(project)], {type:'application/json'}));
  const a = document.createElement('a');
  a.href = url; a.download = 'mi-habitacion.habitacion.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
