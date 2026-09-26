# Estado del proyecto y traspaso a Codex

Cierre del traspaso: 27-09-2026. Auditoría de código/pruebas realizada el26-09; revisión final de integridad y publicación el27-09.

Fecha de auditoría: 26-09-2026. Repositorio: https://github.com/alfita133/mi-habitacion · rama de entrega: `main`.
Base GitHub auditada: `56997705af7f77281c462a9cd2901201e2226c4e`; coincide byte a byte con el árbol del checkout Work `97b67fb`. Esta entrega añade documentación, no nuevas funcionalidades. El commit de traspaso se identifica por `git log -1` y el mensaje `Prepare project handoff from ChatGPT Work to Codex`.

## Lectura y criterio de estado
Leer `AGENTS.md`, `REQUIREMENTS.md` y `ARCHITECTURE.md`. Los documentos `docs/` conservan decisiones, contratos y pruebas históricas; algunas descripciones antiguas fueron sustituidas. No hace falta acceder al chat.
- **DONE**: implementación encontrada y pruebas relevantes acreditadas; no implica certificación de todos los navegadores.
- **IN PROGRESS / parcial**: existe parte del código, falta integración, QA o capacidades del objetivo.
- **PENDING**: no implementado.
- **BLOCKED**: necesita entorno externo o levantar una pausa expresa.

## Resumen
Editor geométrico usable con varias habitaciones, polígonos, objetos por piezas, colisiones de aviso, puertas editables, historial, biblioteca y persistencia. Contrato actual **Project V11**, colección V1, IndexedDB V2, pack V1. Fotos/GLB/IA no implementados y expresamente pausados. Revit web tiene contrato/biblioteca; C# sigue sin compilar/probar en Windows.
Última publicación de la app acreditada: V11, fuente `61d1b2728df0e17ee31349ce0ec383ab4f83689e`, 23-09-2026, en https://mi-habitacion-adrian.alfita13.chatgpt.site. El código GitHub contiene cambios posteriores U5: **no confundir snapshot Git con versión desplegada**.

## Funcionalidades con evidencia del código
Rutas relativas al repositorio; los tests son ejecutables, no promesas basadas en la conversación.

| Función / requisitos | Estado y comportamiento real | Evidencia de implementación y pruebas |
|---|---|---|
| Medidas reales R02 | DONE: manual > estimada > ejemplo; validación finita, cm; originales de cada fuente conservados | `src/domain/model.ts`: `valueCm`, `setManualDimensions`, `setEstimatedDimension`, `parseProject`; `tests/domain.test.mjs` |
| Modelo único 2D/3D R04–R05 | DONE: mismo Project/Room/objects; callbacks emiten operaciones y se persisten | `src/ui/RoomEditor.tsx`, `useProject.ts`; `Plan2D.tsx`, `Scene3D.tsx`, `src/geometry/room.ts`; `tests/domain.test.mjs`, `objects.test.mjs`, `polygon-room.test.mjs` |
| Polígonos R03 | DONE dentro del contrato: 3–32 vértices, diagonales/entrantes, paredes ≥10 cm, sin cruces/huecos interiores | `src/geometry/outline.ts`, `src/domain/room-shape.ts`: `setRoomOutline`, `src/domain/model.ts`: `projectSchema`; `tests/polygon-room.test.mjs` |
| Dibujo tipo construcción por clic R03 | **U5 parcial**: clic-esquinas, cierre inicio/Enter, vista provisional/cota, Shift ortogonal, snap 5cm/desactivable, insertar esquina en pared, arrastrar/teclado/coordenadas, undo/redo de borrador. Falta cerrar QA móvil/multiselección y despliegue | `src/ui/RoomShapeEditor.tsx`: `ShapeForm`, `src/geometry/drawing.ts`: `draftPoint`, `nextWallIssue`, `closeDraft`, `projectOnEdge`; 3 casos en `tests/drawing.test.mjs`. QA U5 completo no acreditado |
| Paredes editables R03 | Parcial frente a editor general de construcción: edición mediante contorno/esquinas; reasignación explícita de puertas/ventanas. Sin tabiques interiores independientes, curvas ni agujeros | `setRoomOutline`, `suggestedWallMapping` en `src/domain/room-shape.ts`; pruebas de rechazo de cruces/anfitriones en `polygon-room.test.mjs` |
| Plano y drag R04 | DONE base: selección, arrastre con captura, snap 5cm, cotas/ejes/etiquetas, teclado; contorno/solidos reales compartidos | `src/rendering/Plan2D.tsx`, `src/ui/CoordinateGuide.tsx`; pruebas dominio + QA V11 en `docs/TESTING.md` |
| Visor 3D y navegación R05 | DONE base: perspectiva, OrbitControls, zoom/pan, WASD 20cm, flechas órbita, +/- zoom, Home/Centrar, encuadre; techo inicialmente oculto y contorno superior. GPU real pendiente de QA | `Scene3D.tsx`, `camera-framing.ts`, `renderer.ts`; `tests/navigation.test.mjs` y QA histórico SVG |
| Ampliar vistas y móvil R05/R10 | DONE base, U5 requiere regresión: iconos priorizan/restauran vista, pestañas móviles; no fullscreen del SO | `RoomEditor.tsx`: `layout`, `mobileTab`, `narrow`; `app/globals.css`; QA V11 `docs/qa/v11-mobile.jpg` |
| Crear/editar/eliminar/girar R06 | DONE: caja/compound, propiedades, XYZ y giro, botones15/45/90, operaciones validadas | `src/ui/ObjectsPanel.tsx`, `ObjectTransform.tsx`, `src/domain/objects.ts`, `model.ts`, `groups.ts`; `tests/objects.test.mjs`, `groups.test.mjs` |
| Elevación y alto inicial R02/R06 | DONE: control 3D proyectado cambia baseZ; campos/slider/botones; restaurar alto inicial o apoyar base0 son acciones distintas | `Scene3D.tsx`: `lift`/`onElevate`; `HeightControl.tsx`, `groups.ts`: `resetInitialHeight`; `tests/editing.test.mjs` |
| Agrupar/ocultar/multiselección R06 | DONE dominio; U5 galería necesita QA: grupos planos, piezas conservadas; ocultos físicos; movimiento selección deduplicado | `groups.ts`, `selection.ts`, `ObjectsPanel.tsx`; `tests/groups.test.mjs`, `rooms.test.mjs` |
| Atajos/historial/duplicar R06 | DONE: Ctrl/Cmd C/X/V/Z/Y/ShiftZ; botones, copias IDs nuevos, gestos agrupados; hasta100 pasos; reseteo al cambiar habitación/recargar | `src/domain/history.ts`, `clipboard.ts`, `src/ui/useEditorHistory.ts`, `RoomEditor.tsx`: `command`; `tests/editing.test.mjs`, `groups.test.mjs` |
| Colisiones no bloqueantes R07 | DONE: solapes/exteriores rojos, contacto permitido, XY/giro/Z y fijos; ocultos incluidos, internas de grupo omitidas | `src/collisions/objects.ts`: `collisionWarnings`, `overlaps`; `convex.ts`, `outline.ts`; `tests/objects.test.mjs`, `fixed-volumes.test.mjs`, `curved-collisions.test.mjs`, `polygon-room.test.mjs` |
| Formas huecas/curvas R07 | DONE base: caja, cilindro elíptico vertical y elipsoide; 1–32 piezas/objeto, huecos libres, GJK analítico para curvas. No mallas arbitrarias ni articulación | `src/domain/parts.ts`, `templates.ts`, `src/geometry/object-parts.ts`, `src/collisions/convex.ts`; `tests/parts.test.mjs`, `curved-collisions.test.mjs` |
| Editor de piezas R07 | DONE base: borrador cm, transparentes arriba/frente, añadir/duplicar/quitar/plantilla, guardar en un paso; escalado global proporcional | `src/ui/PartsEditor.tsx`, `src/domain/parts.ts`; `tests/parts.test.mjs`; QA V10 documentada |
| Puertas/ventanas estructurales R08 | DONE base: huecos reales con marco, vidrio/montante, decoración de hoja; mover por pared/editar anfitrión/medidas, borrado protegido | `src/domain/openings.ts`, `move-opening.ts`, `src/geometry/openings.ts`, `src/rendering/room-meshes.ts`, `StructurePanel.tsx`, `OpeningPosition.tsx`; `tests/openings.test.mjs` |
| Apertura de puertas R08 | Parcial respecto a contacto físico exacto: ratón2D/3D/teclado, silueta/arco sin colisiones; límite por eje de hoja con otras paredes. Espesor no incluido en límite | `src/geometry/door-leaf.ts`: `doorLeaf`, `doorAngleAtPoint`, `maxDoorAngle`; `Plan2D.tsx`, `Scene3D.tsx`; `tests/door-swing.test.mjs`, `navigation.test.mjs`, `polygon-room.test.mjs` |
| Fijos editables R08 | DONE base: volúmenes separados, seleccionar2D/3D, arrastrar plano/teclado, propiedades y borrado confirmado | `src/domain/fixed-volumes.ts`, `fixed-volume-operations.ts`, `src/ui/FixedVolumesPanel.tsx`, `Plan2D.tsx`; `tests/fixed-volumes.test.mjs` |
| Catálogo drag & drop R09 | DONE base; U5 miniaturas parcial QA: escritorio/cama/silla/armario/estantería/ventilador/mesa/caja + puerta/ventana/pilar/radiador. Drag al plano; clic/Enter añade. Dimensiones ejemplo | `src/domain/presets.ts`: `presets`, `addPreset`; `src/ui/PresetLibrary.tsx`; `tests/polygon-room.test.mjs`; QA drag base V11 documentada |
| Galería visual R09/R10 | U5 IN PROGRESS: miniaturas SVG de misma geometría, búsqueda, estado, botones mostrar/ocultar, modo selección múltiple | `src/rendering/ObjectThumbnail.tsx`, `src/ui/ObjectsPanel.tsx`, `PresetLibrary.tsx`, `app/globals.css`; inspección código, falta QA integral |
| Minimalismo/accesibilidad R10 | Parcial: acciones primarias/contextuales, ayudas plegables, foco, ARIA, teclado, controles grandes, responsive. Sin auditoría completa AA/lector/Safari/táctil | `RoomEditor.tsx`, componentes UI, `Plan2D.tsx`, `Scene3D.tsx`, `app/globals.css`; QA V11 histórica, U5 pendiente |
| Varias habitaciones R11 | DONE: colección independiente, crear/renombrar/duplicar/abrir/eliminar, validación y migración del guardado único | `src/domain/rooms.ts`, `src/ui/RoomsDialog.tsx`, `useProject.ts`, `src/persistence/database.ts`; `tests/rooms.test.mjs`, `storage.test.mjs` |
| Persistencia/copia R11 | DONE dominio; F7a parcial QA: IndexedDB2, cola serial, rollback, SHA256, JSON antiguo, `.habitacion.pack` binario. Pendiente descarga y reapertura real del pack en navegador | `src/persistence/{database,assets,backup,serialization}.ts`, `src/domain/assets.ts`; `tests/backup.test.mjs`, `storage.test.mjs` |
| Catálogo Revit R14 | DONE web R1 con límites: RFA pendiente, manifiesto procesado, tipos/parámetros, filtros, miniaturas si vienen, original conservado. Vista3D cajas/huecos, sin malla RFA | `src/revit/{schema,files,operations,FamiliesPanel,Parameters,BindingEditor}.ts(x)`; `tests/revit.test.mjs` y QA R1 en `docs/TESTING.md` |
| Asistente de familias R14 | Parcial: reglas locales sobre palabras/categorías, solo sugiere; no LLM. Fallo singular/plural reproducido (B02) | `src/revit/operations.ts`: `suggestions`; `tests/revit.test.mjs` prueba no mutación, no cubre B02 |
| Exportar proyecto Revit R14 | DONE contrato web: sobre JSON con proyecto completo/bindings/parámetros/originales, contorno conservado | `src/revit/operations.ts`: `exportRevit`, `toRevitPosition`; `src/persistence/serialization.ts`; `tests/revit.test.mjs` |
| Complemento Windows R14 | BLOCKED validación R2/R3: fuentes C# y guía/ZIP, no build/ejecución acreditados. Acepta V6–V11 rectangular, rechaza polígonos; retorno solo snapshot original | `integrations/revit/Habitacion.Revit/{Bridge,ExtractFamilies,ImportProject}.cs`, `.csproj`, `integrations/revit/{README,CONTRACT}.md`; ninguna prueba real Windows |
| Fotos/modelos/IA R12/R13 | PENDING y PAUSADO: ni importación individual de fotos/GLB, ni detección ni reconstrucción ni motor local | `src/domain/model.ts` mantiene `photos/models` vacíos; `objects.ts` `photoIds:[]`, `textureId:null`; no módulos activos de imágenes/reconstrucción. Investigación en `docs/FREE_PHOTO_PIPELINE.md` |

## Bugs reproducidos y limitaciones abiertas
- **B01 — aviso Three.js en escenas sin muebles visibles.** Ejecutar `createRoomGroup(createProject().room, [])`: `THREE.Object3D.add: object not an instance of THREE.Object3D. undefined`. `room-meshes.ts` llama `group.add(...createObjectGroup(...).children)` con array vacío. Observado repetidamente en tests, que pasan; no demostrado fallo fatal. Pendiente corrección posterior al traspaso y caso regresión vacío/todos ocultos.
- **B02 — sugerencia redundante de escritorio.** `suggestions(addPreset(createProject(),'desk',100,100).project,'zona de estudio')` incluye `escritorios`, pese a existir objeto categoría `Escritorio`. `suggestions` compara nombres sin normalización singular/plural. Reproducción directa el26-09-2026; no arreglado durante migración.
- **L01 — apertura puerta:** límite basado en segmento central, no volumen de espesor ni herrajes. No declarar contacto volumétrico exacto. Hoja/arco siguen sin colisiones con muebles por requisito.
- **L02 — paredes poligonales:** extremos exteriores sin inglete pueden dejar pequeños huecos visuales; perímetro interior y físicas por contorno. No tabiques interiores/arcos/huecos de patio. Paredes editables por contorno, no editor general BIM.
- **L03 — piezas:** dimensionar padre escala proporcionalmente, incluido grosor de tablero/pies; escritorio elevable articulado P4 pendiente. 1–32 piezas, sin inclinación X/Y/CSG ni colisiones de malla arbitraria.
- **L04 — render/calidad:** QA anterior mayoritariamente SVG; WebGL portátil, Safari, táctil y FPS reales pendientes. SVG sin texturas/sombras. Build avisa bundle >500kB.
- **L05 — persistencia:** una pestaña editora; no sincronización nube/dispositivos. Historial y clipboard efímeros; colección persistente. Sin GC de blobs huérfanos. Descarga `.pack` no cerrada en QA real, sin prueba de que la app esté rota.
- **L06 — Revit:** fuente preparada sin compilar; runtime objetivo configurado net8.0-windows/Revit2026 debe verificarse con instalación exacta. Sin Revit Web/LT, modelos detallados ni sincronización de cambios realizados allí; importaciones repetidas crean duplicados. Cara/techo/adaptativas no soportadas, informe y omisión. No crea entidad Room BIM. Huecos con familia mantienen semántica estructural, no todos los comandos de muebles.
- **L07 — UX/accesibilidad:** mejoras presentes, no certificación WCAG2.1AA ni lector de pantalla. Necesita QA de controles U5, foco/selección múltiple/móvil y estados vacíos.
- **L08 — límites del contrato:** hasta100 objetos,50 grupos,64 huecos,64 fijos,40 familias por proyecto; RFA8MB; JSON40MB; assets128 referencias/32MB por archivo/128MB total. Son restricciones actuales, no deseos del usuario.

## Intentos anteriores, correcciones y decisiones descartadas
- El bloqueo de colisiones era una versión anterior: sustituido a petición por avisos no bloqueantes. `sweptOverlap` permanece como función histórica/test, no debe volver a bloquear el editor.
- Colisiones curvas mediante prismas/polígonos conservadores producían falsos positivos en ventilador/almohada: reemplazadas por soporte analítico/GJK (`curved-collisions.test.mjs`). Captura del usuario no era una copia editable: no se reprodujo su habitación exacta.
- Entorno gráfico sin WebGL motivó SVGRenderer real; no capturas falsas de3D. Render GPU aún debe comprobarse en portátil.
- Cargas de RFA8MB provocaron problemas de regex/pila: procesamiento por bloques y test existente. Cabecera OLE sigue sin validar semántica RFA.
- Descarga `.pack` en navegador cloud no apareció en carpeta compartida; quedó enlace explícito de descarga. Fallo de entrega no equivale a fallo demostrado del formato/almacenamiento.
- Lista extensa de texto/ayudas permanentes y dibujo anterior no convencieron al usuario. U5 es el rediseño autorizado que falta validar, no volver a la lista antigua.
- Google Lens automático/API gratuita no se verificó. APIs pagadas, Electron/Docker obligatorio, TripoSR/TRELLIS como ruta base no adoptados. Investigación local es propuesta, no instalación ejecutada.
- Migración GitHub: creación privada se bloqueó en revisión; usuario autorizó público. Hubo bloqueo temporal de cuota, luego resuelto. Git push HTTPS de Sites no tenía credenciales; la transferencia se realizó por Git Data API y se comparó árbol completo. Ninguno de estos bloqueos de herramientas es bug de la app.
- GitHub se inició como snapshot con historial propio (3 commits antes de esta entrega). Código/archivos sí completos; historia Work anterior sigue separada. No ejecutar force-push para «repararlo».

## Validación de esta entrega
- Linux, Node `v24.19.0`, dependencias instaladas existentes; instalación limpia Windows **no** probada.
- `npm test`: **78/78 PASS**, sin saltados/fallos; warnings B01 registrados.
- `npm run typecheck`: **PASS**.
- `npm run build`: **PASS**, Vinext/Vite; warning de bundle grande y clasificación estática de ruta desconocida no bloqueantes.
- Arranque portable `npm run dev`: **PASS**, petición local `GET /` **HTTP200**, HTML27981 caracteres con texto de habitación. Proceso y petición verificados juntos; no acredita interacción visual ni WebGL.
- `git diff --check` y revisión de archivos de traspaso; no cambios funcionales, dependencias ni esquema.
- Evidencia visual histórica: `docs/qa/` y `docs/TESTING.md`. No repetir sus resultados como si fueran una nueva sesión de QA.

## Siguiente tarea exacta para Codex
**Cerrar U5 (dibujo por clic + galería visual), sin iniciar fotos/GLB/IA.**
1. Leer estas guías y comprobar Git. Instalar dependencias, ejecutar tests/typecheck y abrir la app.
2. Reproducir B01 en vacío y con todos los objetos ocultos; corregirlo con una comprobación/regresión pequeña, sin rediseñar el renderer.
3. En escritorio probar: Dibujar → Trazar paredes → polígono en L por clics → cierre → Aplicar; añadir esquina sobre una pared, moverla/editar coordenadas; cruces inválidos; deshacer/rehacer; preservar anfitrión y medidas de puerta/ventana.
4. Probar galería y presets: miniaturas, búsqueda, selección múltiple/unir/separar, ocultar/mostrar, clic/Enter y arrastre al plano; misma selección/posición/forma en3D. Probar 390px y navegación de teclado/foco, además de escritorio.
5. Guardar/recargar/importar copia del caso poligonal con puerta y piezas; verificar 2D/3D y apertura limitada. Registrar pasos, resultados, capturas y consola, corrigiendo fallos reales antes de marcar DONE.
6. Mantener U5 IN PROGRESS si no hay entorno de navegador. Si se dispone de Sites, publicar solo después de cerrar QA y conservar identidad/URL. Si no, dejar commit listo y despliegue pendiente documentado; no exigir Work para seguir desarrollando.

Después: resolver B02; cerrar descarga/reimportación real F7a; P4 altura vinculada de escritorio (primero contrato/pruebas, sin escalar tablero/pies). RevitWindows es rama independiente. Fotos/GLB/IA permanecen pausados hasta nueva autorización.

## Ejecutar desde un clon nuevo
Node >=22.13 (auditado con24.19); gestor exacto `pnpm@11.25.0` según package.json/lockfile. Tener pnpm de esa versión disponible antes de instalar.

```sh
git clone https://github.com/alfita133/mi-habitacion.git
cd mi-habitacion
pnpm install --frozen-lockfile
pnpm dev
# http://localhost:5173
pnpm test
pnpm typecheck
pnpm build
```

`npm run dev/test/typecheck/build` ejecuta los mismos scripts si las dependencias ya están instaladas; no sustituir el lockfile por package-lock. Perfil portable automático sin `.sites-runtime`. `pnpm start` usa Wrangler local y exige build; no hace falta para desarrollo. Comandos RevitWindows separados en `integrations/revit/README.md`, no prometidos como verificados.

## Qué migra y qué no
Código, pruebas, lockfile, documentación, fuentes C# y siete binarios de QA/ZIP sí están en Git. Este traspaso agrega tres archivos raíz y actualiza AGENTS y guías. Secretos/node_modules/builds/temporales fuera.
Las habitaciones reales están en IndexedDB del navegador/origen anterior, **no dentro del repositorio**. Para usarlas localmente: en la app anterior Archivo → preparar/descargar copia de cada habitación; en la nueva Abrir copia. Conservar archivos descargados y verificar antes de borrar datos anteriores. Fotos reales no han sido importadas por esta app.
