# Estado del proyecto

## Objetivo actual
2026-09-26 — Respaldo GitHub **DONE**: `https://github.com/alfita133/mi-habitacion`, público, rama `main`, 204 archivos versionados. Primer snapshot completo publicado en `52f5b365e52417684ae6d666f171ba8c0a664e8a`; árbol `e14104d657ca931ec68869384128479ccaa6d166` idéntico al local `a7a199e`, incluidos los siete binarios. Este checkpoint documental se publica después. Transferencia por API GitHub; no se usó git push por falta de autenticación de shell. Historial anterior conservado en local/Sites; GitHub tiene historial independiente del snapshot. Remotos: `origin` Sites, `github` GitHub. No forzar push entre historias; continuar en un clon de GitHub para trabajar allí. 78 tests y TypeScript PASS en el último checkpoint de código; este cambio solo documenta el respaldo. Siguiente objetivo funcional: cerrar U5.

2026-09-23 — U5 IN PROGRESS: rediseño solicitado tras captura de lista de objetos. Prioridad sobre P4: dibujo encadenado por clic, tramo provisional/cotas, insertar esquinas y biblioteca visual con miniaturas derivadas del modelo. Referencias oficiales Sweet Home3D/Floorplanner consultadas; sin cambiar esquema ni iniciar fotos/GLB. Geometría de borrador, lienzo amplio y miniaturas compartidas implementados; 78 pruebas PASS. Siguiente: QA de dibujo ratón, miniaturas, selección múltiple y móvil; corregir antes de publicar.
2026-09-23 — U1–U4 DONE; publicación SUCCEEDED. ProjectV11: contorno poligonal simple, puerta limitada por paredes sin colisión con muebles, biblioteca de elementos y UI contextual/móvil. 75 tests PASS y TypeScript PASS. QA navegador: L por clic y coordenadas, arrastre de preset/fijo, teclado, puerta90°, ocultar, edición contextual, recarga y móvil390px PASS. Capturas en docs/qa/v11-*.jpg. No se han iniciado fotos/GLB/IA.

2026-09-22 — Ajuste de usabilidad implementado: puerta de referencia sin colisiones; arrastre 2D/3D con historial; WASD con foco del visor; encuadre por esfera/frustum; techo delimitado y UI con Archivo/Ayuda. 68 pruebas PASS y TypeScript PASS. QA ratón en ambas vistas, undo/redo, recarga74°, WASD y ayuda PASS. Publicación SUCCEEDED (registro al final).

2026-09-22 — Corrección prioritaria: falsos avisos en curvas, armario y forma de puertas/ventanas. Corregido soporte analítico GJK y límites exactos, 66 tests PASS y TypeScript PASS. QA tangencia frente a penetración y representación estructural PASS. Publicación SUCCEEDED, registro final añadido.

2026-09-22 — Sistema mixto de objetos por piezas y plantillas, autorizado por el usuario. P1–P3 terminadas y probadas; P4 pendiente. Fotos/GLB/IA siguen excluidos. Equipo ASUS TUF Gaming F15, i7-12700H, RTX3050 Laptop,16GB RAM; VRAM/SO a verificar para inferencia futura.

## Fase actual y fases terminadas
F0–F5.5/F6/R0/R1 DONE. P1 colisiones compuestas, P2 editor, P3 cuatro plantillas DONE. F9b IN PROGRESS por P4 articulación. F7a IN PROGRESS solo por descarga final no verificada. R2/R3 BLOCKED por Windows/Revit. F7b/F9a/F8 no iniciadas.

## Funcionalidades implementadas
- ProjectV11 con migracionesV1–V10; DB2/colección1/pack1 conservadas. Varias habitaciones, copias, medidas manuales prioritarias.
- Objetos caja o compound con1–32piezas: cajas, cilindros verticales/elípticos y elipsoides. 2D/3D/colisiones comparten geometría; huecos entre piezas libres. Identidad/posición/grupos/binding conservados.
- Añadir objeto permite plantilla: cama, escritorio, estantería, ventilador y personalizado. Forma y colisiones permite convertir existente, editar en cm, añadir/duplicar/quitar piezas, vista transparente y guardar un solo paso de historial.
- Giro15/45/90, arrastre2D, elevación3D, medidas/alto inicial, ocultación, grupos, copiar/cortar/pegar, undo/redo siguen vigentes. Ocultos siguen contando físicamente.
- Puertas/ventanas por pared; hoja/arco configurable; obstáculos fijos protegidos. Colisiones rojas sin bloquear.
- Biblioteca Revit pendienteRFA/manifiestos, bindings/parámetros/originales conservados. C# aceptaV6–V11 rectangular; rechaza polígonos antes de modificar Revit e informa que piezas procedurales no cambian familia; no compilado Windows.
- Copias completas .pack con SHA256 y rollback; JSON antiguo sigue abriendo. Binarios separados y deduplicados. Sin importación individual de fotos/GLB.

## Última tarea completada
2026-09-23: cierre QA V11. Corregidos arrastre mediante pointer capture, formulario móvil, etiquetas legibles, paredes recortadas por arista, clamp de puerta tras carga/cambio de forma, revisión de anfitriones al invertir contorno. ZIP de Revit actualizado.
2026-09-22: interacción de puertas, navegación y simplificación. Archivo agrupa copias; Ayuda agrupa instrucciones/ejes; formularios conservan controles con ayudas y deslizadores secundarios plegables. El clic en hoja 3D selecciona; su arrastre cambia únicamente swing.angleDeg.

Corrección de falsos positivos: bases ya no se inflan y elipsoides ya no ocupan prisma completo. Armario de8piezas editable; ventana con montante central y puerta con decoración de paneles/marcador de manilla sin ampliar su volumen. EsquemaV10 intacto; actualiza objetos guardados automáticamente al recargar. Se verificó caso sintético equivalente, no el archivo de habitación exacto del usuario (solo captura disponible).

P1–P3:60 tests Node PASS, TypeScript PASS; QA crear escritorio y cajonera en hueco sin aviso, editar tablero4→5, undo/redo y recarga; cama/ventilador y avisos contacto patas. Publicación V10 SUCCEEDED, consultar registro al final. Próxima tarea funcional P4; límites de curvas y escalado explícitos en UI.

## Checkpoints anteriores
2026-09-21 — F6: ProjectV8 con fixedVolumes, edición estructural separada y confirmación de borrado. Avisos SAT+Z contra volúmenes fijos y hoja actual, rojo sin bloquear.47 pruebas PASS, TypeScript/lint PASS. QA pilar30×30×260 solapado con mesa, guardado con aviso, undo/redo y recarga.

2026-09-21 — F5.5b: hoja2D/3D y arco, bisagra/sentido/ángulo/grosor, ProjectV7 migra V1–V6 sin inventar apertura.43 pruebas PASS y TypeScript PASS. QA crear puerta, editar bisagra/45°, undo90°, redo45°, recargar45° y captura visual2D/3D. C# aceptaV7 e informa apertura no mapeada (sin validación Windows).

2026-09-21 — F5.5a: botones45°/90°, QA navegador giro0→45→135, deshacer→45, rehacer→135;7 pruebas grupos/historial PASS, TypeScript PASS. App ejecutada en preview.

2026-09-21 — Registrado hardware confirmado y evaluación conservadora, consultadas fuentes oficiales Ollama/TripoSR/TRELLIS.2 y revisado código actual de objetos/esquema/persistencia. ROADMAP ahora separa incrementos y dependencias, reincorpora análisis multivista de habitación y distingue Revit como rama independiente. Solo documentación: validación `git diff --check` y revisión de coherencia, sin pruebas de inferencia ni cambios de aplicación. Guardar checkpoint mediante commit/push.
2026-09-21 — Investigación previa de alternativas gratuitas registrada en FREE_PHOTO_PIPELINE.md. Ningún motor instalado ni probado en equipo del usuario.

40 pruebas Node PASS, typecheck y lint PASS. Build producción PASS (Vinext/worker). QA web con fixtures explícitamente sintéticos: RFA pendiente no añadible; manifiesto, búsqueda, sugerencias sin añadir; añadir120×60×75 en X450/Y100/Z20 fuera de límites (rojo), giro15°, parámetro Code modificado; recarga conserva todo; exportación real recuperada y reimportada como segunda habitación con bindings/parámetros. 3D SVG compatible inspeccionado visualmente. Cabecera OLE solo filtro preliminar, no valida contenido real RFA. Corregido desbordamiento de pila de regex para originales8MB.
QA F5.4 previa: puerta norte offset40→140 mediante arrastre, Deshacer→40, cambio a este/offset120; hueco real3D actualizado. Pruebas de dominio incluyen ventana/cotas y geometría.

## Siguiente tarea exacta
Cerrar QA U5: comprobar en navegador selección múltiple de tarjetas y diseño móvil, corregir incidencias y publicar con Sites solo después de verificar. Dibujo y miniaturas ya codificados; 78 tests PASS. Después continuar P4. No iniciar fotos/GLB/IA.

Siguiente tarea funcional exacta: P4, definir contrato de altura vinculada para escritorio elevable y pruebas de tablero/travesaño/patas/pies, preservando modelos personalizados. No iniciar fotos/GLB/IA.

P4: diseñar parámetros vinculados de escritorio elevable (tablero y travesaño suben, patas se alargan, pies/grosores no se escalan), preservar modelos personalizados y migración. Implementar/probar antes de extender a otros mecanismos. Fotos/GLB/IA siguen excluidos. Prueba pendiente independiente: Exportar copia→Descargar copia→Abrir copia del archivo en navegador real; cloud no entregó download enF7a. WebGL portátil y RevitWindows requieren equipo compatible.

## Errores conocidos, límites y pendientes
V11: contorno simple de 3–32 vértices, paredes rectas de mínimo10cm, sin huecos interiores/curvas. Límite de apertura usa eje de hoja, no espesor. Uniones exteriores de pared sin inglete pueden dejar pequeños huecos visuales; perímetro interior y colisiones usan el contorno exacto. Revit poligonal bloqueado explícitamente. Contraste de paleta comprobado, no auditoría WCAG completa ni lector real.
Sin error crítico web conocido. R2 no compilado ni ejecutado: código preparado NO equivale a complemento validado. Sin Revit Web/LT ni servicio externo conectado. Hospedajes de cara/techo/adaptativos omitidos con informe; importaciones Revit repetidas crean elementos nuevos, no actualizan. Familia incompatible con medidas manuales se omite sin escalar. No mallas Revit/fotos reales en web todavía.
Máximo100piezas/50grupos/64huecos/40familias por habitación; RFA8MB, originales+miniaturas30M caracteres base64, JSON40MB. Es una biblioteca pequeña por habitación; no catálogo global. Miniaturas ausentes etiquetadas. Puertas/ventanas conservan semántica estructural (sin agrupar/ocultar como muebles); se mueven por pared, no libremente fuera de ella.
Huecos no solapados ni fuera de pared; dimensiones reales nunca se recortan automáticamente. Hoja configurable solo de referencia: ni hoja ni sector producen colisiones por decisión expresa del usuario; obstáculos fijos sí. Cajas o piezas procedurales aproximadas. Curvas usan soporte analítico 3D con tolerancia numérica; escalado general proporcional, articulación P4 pendiente. Sin QA WebGL/Safari/táctil; cloud usa renderer SVG sin texturas/sombras. Solo una pestaña de edición: no sincronización simultánea ni dispositivos. Exportar copia para transferencia/respaldo. Historial y clipboard se reinician al cambiar habitación/recargar.
Históricamente el JSON se descargó y comprobó pese al timeout. En F7a el paquete no apareció en el directorio compartido: descarga UI pendiente, no atribuirlo sin evidencia a un fallo de aplicación. Se ofrece enlace explícito tras preparar la copia para conservar gesto de usuario. Sin errores de aplicación observados; logs de extensión excluidos.

## Archivos importantes
- `src/domain/parts.ts`, `templates.ts`, `geometry/object-parts.ts`, `ui/PartsEditor.tsx`: composición.
- `src/domain/model.ts`: V11 y migraciones históricas; `objects.ts`, `groups.ts`, `rooms.ts`, `history.ts`, `clipboard.ts`, `move-opening.ts`.
- `src/revit/schema.ts`, `operations.ts`, `FamiliesPanel.tsx`, `BindingEditor.tsx`, `files.ts`: contrato, operaciones y biblioteca.
- `src/ui/RoomEditor.tsx`, `OpeningPosition.tsx`, `ObjectsPanel.tsx`, `HeightControl.tsx`, `useProject.ts`, `useEditorHistory.ts`.
- `src/rendering/Plan2D.tsx`, `Scene3D.tsx`, `room-meshes.ts`; `src/geometry`, `src/collisions`, `src/persistence`.
- `integrations/revit` fuente/guía; `public/revit-integration.zip` copia descargable, regenerar si cambian fuentes/guía.
- `tests/*.test.mjs`, `docs/TESTING.md`, `REVIT_INTEGRATION.md`, `RESEARCH.md`.

## Comandos
Node>=22.13, pnpm definido por packageManager/lockfile. Local: `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm test`, `pnpm typecheck`, `pnpm build`.
Work: `node /opt/codex/tools/pnpm/bin/pnpm.cjs test`; `node node_modules/typescript/bin/tsc --noEmit`; `node node_modules/eslint/bin/eslint.js src app/page.tsx`.
QA: `sites-preview start /workspace/sites/mi-habitacion`; finalizar `sites-preview stop`. Usar control-browser y preview, nunca cloud browser contra sitio publicado. Build/publicación con skill Sites y scripts del plugin.
Revit: comandos de compilación Windows en `integrations/revit/README.md`; ensamblados Autodesk oficiales no distribuidos.

## Dependencias y decisiones
React19.2.6, TypeScript5.9.3, Vinext1.0.0-beta.5, Three0.180.0, Zod3.25.76. Añadidas @noble/hashes2.0.1 (SHA256 incremental) y fake-indexeddb6.2.4 (solo tests). Sin servicio de pago. Dominio cm Zvertical; Three(X,Z,Y), giro negativo. Revit(X,-Y,Z) en pies, giro negativo/radianes. V6 incorpora originalesbase64 en proyecto para copia portable sencilla; fotos futuras en assets. D014 estructura móvil y D015 integración Revit.

## Recuperación y publicación
Repositorio `/workspace/sites/mi-habitacion`, main; `.openai/hosting.json` project_id `appgprj_6aa9d015390481919355267a347683f9`. Mantener URL, audiencia actual y remoto existente; acceso actual public comprobado 2026-09-21, sin cambiarlo. No guardar tokens ni datos del usuario. Stash recovery-old-checkout histórico sin cambios únicos; no reaplicar. Git y documentos reconstruyen el estado sin conversaciones.

Última publicación F5.3 SUCCEEDED (2026-09-17T13:51:52Z): source 1a26ab37022b94e016cd5a17063635e0360b23e2; sitio v5, Project V5/colección1. Version appgprj_6aa9d015390481919355267a347683f9~appgver_76f22cfd8ec4819181aad4d401d20001; deployment appgdep_6aabf06ca5548191870c84e5b2e35c9e. Build y archivo PASS. Confirmación terminal recibida; cambios posteriores solo documentales.


Última publicación R1/F5.4 SUCCEEDED (2026-09-20T19:37:08.156300+00:00): source 2c22d94808cfa0fa3578afcfc78b3b264cfcb3e1; sitio v6, ProjectV6/colección1. Version appgprj_6aa9d015390481919355267a347683f9~appgver_0fe376d7788881919fe12f6ec9a71812; deployment appgdep_6ab035d09bb08191ba61526a1606a688. URL privada https://mi-habitacion-adrian.alfita13.chatgpt.site. Se reutilizó el artefacto ya probado/guardado, sin cambios de código ni pruebas redundantes. Pendiente solo validación Windows para complemento, no publicación web. Los commits posteriores de documentación no cambian el código publicado.

Referencia actual de runtime consultada2026-09-21: https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/System-requirements-for-Revit-2026-products.html (2026.5+ requiere.NET10). Antes de compilar, reconciliar con instalación exacta; no cambiar automáticamente baseline ni afirmar compatibilidad.

## Publicación del checkpoint V9 — 2026-09-21
SUCCEEDED 2026-09-21T22:44:06.054450+00:00. Código b4d1cb632d714655f8c7161aea71974d7769d0b0; version appgprj_6aa9d015390481919355267a347683f9~appgver_4d0a8be95fb4819194bc162ec242aa25; deployment appgdep_6ab1b324a0748191beb40da584f8beaa. URL https://mi-habitacion-adrian.alfita13.chatgpt.site. El intento privado guardó versión y rechazó desplegar por audiencia; get_site confirmó public (política existente desde20sept), se reutilizó versión mediante despliegue general sin modificar permisos. 55tests/typecheck/lint/build PASS. F7a permanece IN PROGRESS exclusivamente por descarga UI pendiente. Este checkpoint documental no cambia código publicado. Captura sintética docs/qa/v9-checkpoint.jpg.

## Publicación V10 — 2026-09-22
SUCCEEDED 2026-09-22T11:24:18.639795+00:00. Código6fee08e80ab96963e0bc723b7b264f3ebb0ca793. Versión appgprj_6aa9d015390481919355267a347683f9~appgver_0855006ff1bc8191afc67961996f2160. Despliegue appgdep_6ab2654e9f2081918bcb8de495ede771. URL https://mi-habitacion-adrian.alfita13.chatgpt.site; audiencia public existente conservada.60 tests, TypeScript y build PASS; QA descrita en TESTING.md y captura docs/qa/v10-parts.jpg. Sin nuevas dependencias. Checkpoint posterior solo documental. Próxima acción P4, no fotos/GLB.

## Publicación corrección curvas — 2026-09-22
SUCCEEDED2026-09-22T15:36:49.795453+00:00; código5200484cbe5c427d95bc8612a3f5656d71b96f5f. Versión appgprj_6aa9d015390481919355267a347683f9~appgver_fcc6349d41f88191be3b5abd933ec3f0; despliegue appgdep_6ab2a07c999c81918063e85ae10b6706. URL https://mi-habitacion-adrian.alfita13.chatgpt.site; audiencia public conservada.66tests/TypeScript/build PASS. Próxima tarea P4; si el usuario aporta copia de habitación con aviso restante, priorizar reproducción exacta. Este checkpoint documental no cambia código publicado.

## Publicación de navegación2026-09-22
SUCCEEDED2026-09-22T16:21:34.746869+00:00. Source3d1d4bd9e114118e726b14276af7225c9bd89906; versión appgprj_6aa9d015390481919355267a347683f9~appgver_cebe739f75348191ac47893632419dd4; deployment appgdep_6ab2aaf8b5f8819196236f6e7f45ca49. URL https://mi-habitacion-adrian.alfita13.chatgpt.site. Audiencia public conservada. Build PASS; captura docs/qa/navigation-qa.png. Archivo, Ayuda, formulario simplificado y ampliar/restaurar vistas verificados. Siguiente trabajo P4 arriba; fotos/GLB/IA no iniciados. Commit posterior solo documental.

## Publicación V11 — 2026-09-23
- Fuente: 61d1b2728df0e17ee31349ce0ec383ab4f83689e. Build producción PASS; aviso no bloqueante de bundle >500kB.
- Versión: appgprj_6aa9d015390481919355267a347683f9~appgver_3cc5a321e7c08191af93138a52466186 (11).
- Deployment: appgdep_6ab439436d988191b3d6e3dbfe0fe83e, SUCCEEDED 2026-09-23T20:40:53.170057+00:00.
- URL: https://mi-habitacion-adrian.alfita13.chatgpt.site
- Este checkpoint documental posterior no cambia el código desplegado.
