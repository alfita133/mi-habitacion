# Arquitectura — registro histórico

**Guía vigente consolidada:** [ARCHITECTURE.md](../ARCHITECTURE.md) en raíz. Lo siguiente conserva evolución por fases. Las antiguas afirmaciones sobre bloqueo de colisiones, hoja física, ausencia de muebles, física conservadora y prohibición de otro repositorio están sustituidas. GitHub público está autorizado. SVG fallback, ProjectV11, piezas/GJK, hoja de referencia y assetsV9 son la situación actual.

Aplicación personal con habitaciones independientes y una habitación activa. React + TypeScript del starter compatible con Sites; Three.js directo para 3D y SVG para plano. Vinext sirve la web; los datos de la habitación se procesan en el navegador. Sin API de negocio ni base de datos remota.

## Capas
- `src/domain`: esquema versionado, medidas, validación y operaciones inmutables. No importa React, DOM ni Three.
- `src/geometry`: funciones puras que convierten el dominio en suelo/techo/paredes y, posteriormente, huellas de objetos.
- `src/rendering`: componentes independientes de plano y escena. Consumen la misma habitación; nunca son fuentes de medidas.
- `src/ui`: formularios, controles de guardado y estado de la sesión. Una única instancia del proyecto.
- `src/persistence`: IndexedDB y serialización/validación JSON. V9 añade store de assets y copia binaria; importación de fotos/GLB aún excluida.
- `src/images`: futuro ingreso de originales, metadatos y normalización de copias para análisis; no confundir preprocesado con detección.
- `src/reconstruction`: futuros adaptadores con capacidades explícitas, trabajos cancelables y resultados revisables. No simular llamadas o porcentajes de IA.
- `src/collisions`: módulo puro separado, OBB/SAT horizontal + intervalos Z. La huella de colisión obedece dimensiones reales, no la apariencia de una malla.

## Flujo de datos
Entrada del usuario → validar una propuesta completa → actualizar proyecto → ambas vistas derivan geometría → persistir. Si la propuesta no es válida, conservar el último estado válido. Los renderizadores no mutan el dominio. Las estimaciones se conservan separadas y jamás sobrescriben manualCm.

## Coordenadas
Centímetros internos. Origen: esquina superior izquierda del plano al nivel del suelo. X aumenta a la derecha, Y hacia abajo (profundidad), Z hacia arriba. Three usa `(X,Z,Y)` con Y vertical. No copiar rotaciones directamente: la rotación alrededor de Z del dominio se convierte con signo negativo alrededor de Y en Three. Las medidas de habitación son interiores; paredes se extienden hacia fuera. Techo forma parte de geometría, aunque se oculte para ver el interior.

## Persistencia y evolución
IndexedDB local al origen y navegador, sin sincronización móvil/PC. Exportación JSON portable del primer hito. Históricamente V1 solo admitía habitación vacía; V6 incluye muebles, grupos y familias. rechazar archivos con entidades no soportadas en lugar de borrarlas silenciosamente. Antes de añadir fotos implementar copia con assets y límites. Cambios incompatibles requieren incrementar schemaVersion e implementar migración explícita.

## 3D y ciclo de vida
Crear renderer exclusivamente en cliente; gestionar ResizeObserver y liberar geometrías, materiales, controles y contexto al desmontar. Limitar pixel ratio para móvil. Mostrar error real si WebGL2 no está disponible; el plano debe seguir funcionando. No hay entrenamiento de IA en el Worker (128 MB por isolate según documentación del entorno).

## Continuidad
Código, lockfile y documentos se guardan en el repositorio del sitio. No almacenar tokens, originales personales o bases locales en Git. No construir un segundo repositorio para el mismo proyecto. Consultar PROJECT_STATE.md antes de cada continuación.

## Adaptación gráfica verificada
`renderer.ts` intenta crear contexto WebGL2 y utiliza SVGRenderer oficial si no está disponible. `room-meshes.ts` crea exactamente las mismas mallas para ambas rutas. SVG usa perspectiva real y eventos OrbitControls, iluminación simple y sin texturas/sombras; las líneas del suelo se ocultan en SVG por limitaciones de ordenación. El modo se indica en UI. La ruta acelerada requiere QA en hardware compatible. Ver TESTING.md para distinguir verificado de pendiente.

## Estructura implementada en F4
`domain/openings.ts` define aperturas y validación de límites/solapamientos en coordenadas de pared. `domain/model.ts` valida el proyecto completo y contiene operaciones inmutables y migración V1→V2. `geometry/openings.ts` corta cada pared en franjas horizontales y conserva los intervalos verticales sin huecos; produce sólidos disjuntos y marcos/vidrio aparte. Sin dependencia CSG.
`StructurePanel` es un editor estructural separado: altas/ediciones en Dialog y borrado protegido por AlertDialog. Puertas y ventanas no pertenecen a objects. Los renderizadores consumen roomGeometry; wallId viaja en metadatos de mallas para ocultar paredes y marcos cercanos juntos. Datos de fotos, muebles y colisiones se incorporarán en sus propias capas.

## Objetos y colisiones F5
objects.ts define contrato y footprint; collisions/objects.ts importa solo tipos del modelo y valores del módulo de objetos, evitando dependencia runtime circular. projectSchema integra validación pura en todas las operaciones. ObjectsPanel edita propuestas atómicas. Plan2D convierte puntero a coordenadas SVG mediante matriz inversa, conserva offset de agarre y captura el puntero. RoomEditor mantiene selección/transitorios separados del proyecto. moveObject valida barrido continuo y destino antes de actualizar el único estado. Scene3D recibe ese array y genera cajas con alturas y giro correctos. No animación ni persistencia de posiciones inválidas. Límites interiores son conservadores con respecto a estructura. Volúmenes fijos interiores pendientes F6.

## V4: política vigente (sustituye bloqueo de F5)
Validación de formato en projectSchema; colisiones calculadas por collisionWarnings y nunca rechazan operaciones actuales. Ese Map por ID dirige rojo y mensajes sin modificar materiales guardados. hidden filtra render, pero no detección física. domain/groups.ts aplica transformaciones a piezas en coordenadas globales alrededor del centro de su envolvente XY, sin cambiar dimensiones. Grupos planos referenciados mediante groupId y registro groups; composición reversible, no CSG. Seleccionar/arrastrar una pieza selecciona/mueve el conjunto entero. Ocultación persistida por pieza; UI permite ocultar/mostrar conjunto. HeightControl reutiliza Slider accesible. CoordinateGuide usa medidas efectivas, no números de ejemplo fijos. Plan encuadra exteriores y congela viewBox durante arrastre para evitar saltos.

## V5: historial y elevación
Historial puro en domain/history.ts; useEditorHistory envuelve cambios antes de persistir. begin/end agrupan gestos; undo/redo usan el mismo guardado. Clipboard en domain/clipboard.ts copia conjuntos preservando medidas y crea IDs nuevos. Historial/clipboard solo en memoria, máximo100pasos. RoomEditor excluye campos/diálogos de comandos. Scene3D emite selección por raycast y baseZ desde handle proyectado, sin mutar dominio. Callbacks por refs; cámara independiente.

## F5.3 — varias habitaciones locales
RoomEditor aloja useProject (colección); RoomSession tiene key=project.id para aislar historial, selección y cámara. RoomsDialog administra proyectos. Colección version1 envuelve Project V5 sin alterar su JSON individual. database migra current a collection en transacción, conserva current como respaldo histórico. Todas las escrituras son snapshots serializados y se confirma guardado al completar transacción. UI usa panel contextual y CSS para ampliar vistas sin recrear Scene3D; ResizeObserver adapta cámara. Selección múltiple deduplica grupos en domain/selection.ts.

## Integración Revit V6
src/revit/schema.ts contiene DTO sin React; operations.ts valida catálogo/referencias y crea objetos o aperturas. FamiliesPanel/Parameters/BindingEditor UI desacoplada; files.ts limita y conserva originales binarios sin procesarlos. ProjectV6 añade families y binding revit opcional en objetos/aperturas. Historial/copia/duplicación conservan bindings. Render actual aproxima por cajas y huecos, no mallas de familias. Complemento integrations/revit independiente, no corre dentro de Sites.

## Propuesta local para fotos (L0/F7–F10, NO implementada)
Reutilizar editor/dominio y añadir host local con servicioNode enloopback para inferenciaOllama/trabajos. Evaluar arranqueWindows antes de elegir empaquetado; no introducirElectron/Docker por defecto. El modelo devuelve propuestaJSON, generadores deterministas crean geometría; fuentes/comparaciones y modo deescaneoGLB en FREE_PHOTO_PIPELINE.md. El sitio publicado mantiene funcionamiento actual hasta cambios probados.

## Secuencia propuesta de integración (2026-09-21)
ROADMAP.md gobierna dependencias. Completar pequeñas mejoras geométricas sin depender del motor de visión. Un único almacén/copia de assets alimenta fotos y GLB; un contrato de representación soporta caja, receta por piezas y malla. Desarrollar edición manual de recetas antes de que el adaptador de IA las proponga. La inferencia no escribe el proyecto: produce una propuesta validada para confirmación y una operación deshacible. El puente local se evalúa aparte en L0 y solo se integra tras decisión del usuario. No duplicar la UI ni el dominio para nube/local; Revit continúa en un adaptador independiente. Consultar FREE_PHOTO_PIPELINE.md para presupuesto conservador del portátil, aún sin benchmark.

V7: domain/door-swing define estado; geometry/door-leaf transforma bisagra/sentido sobre cuatro paredes y produce endpoints/OBB. Plan dibuja hoja/arco y escena el mismo volumen. Hoja no hereda corte de pared cercana, para permanecer visible. UI DoorSwingFields compartida por formulario estructural e inspector. Migraciones explícitas en model; C# informa swing no mapeado.

V8: fixed-volumes y fixed-volume-operations mantienen estructura separada de objetos. FixedVolumesPanel edita mediante diálogo, clic en plano/3D abre edición protegida. CollisionBody comparte solo posición/giro/dimensiones; SAT+Z calcula avisos simétricos muebles↔fijos/hojas, fijos↔fijos/hojas y hojas↔hojas. El renderer usa IDs para rojo derivado, nunca cambia materiales guardados. C#V8 preserva fijos y swing en snapshot con informe de no representación Revit.

## V9 — almacenamiento y respaldo
assets.ts del dominio valida referencias. persistence/assets.ts calcula SHA256 incremental (noble/hashes), independiente de HTTPS/WebCrypto. database.ts serializa escrituras y guarda colección+blobs atómicamente; la UI aplica restauración solo tras éxito. backup.ts codifica/valida contenedor .habitacion.pack; RoomEditor prepara snapshot y muestra enlace Descargar copia explícito, revoca URL al cerrar/cambiar habitación. JSON permanece para intercambio Revit y copias antiguas. No GC prematuro, no fotos ni mallas interpretadas. fake-indexeddb solo en pruebas cubre migración de store, cuota y rollback; el navegador verificó persistencia real por recarga.

## V10 — representación procedural común
`domain/parts.ts` contrato independiente; `domain/templates.ts` recetas iniciales; `geometry/object-parts.ts` aplica posición/rotación padre a piezas locales y genera huellas. `collisionWarnings` usa el mismo desglose para muebles entre sí, hojas/fijos y límites. `room-meshes` crea una malla por pieza con el mismo objectId para selección/elevación; `Plan2D` dibuja huellas dentro del mismo grupo arrastrable. Grupos/clipboard/history no necesitan representación alternativa.
`PartsEditor` mantiene borrador aislado con vista transparente arriba/frente, entradas en cm, alta/duplicación/borrado y plantillas; guardar aplica una operación histórica y cerrar cancela. ObjectsPanel permite elegir plantilla al crear o convertir existente desde Forma y colisiones. No inferencia ni catálogo externo. Forma visual ellipsoid es esfera escalada; su física es conservadora, explícita en UI. Vincular partes a una altura regulable será P4, no reinterpretar el escalado general actual como articulación.

## Corrección de curvas posterior a V10
`collisions/convex.ts` implementa soporte analítico y GJK con punto más cercano al simplex mediante conjuntos activos (1–4vértices). Geometría curva se calcula en3D: ya no extruir la huella elíptica del elipsoide. Límites físicos usan extremos del soporte, sin inflar el polígono. `solidFootprint` queda para plano y SAT de cajas. Sin nueva dependencia/esquema. Las superficies de paneles de puerta permanecen coplanares y usan polygonOffset; no aumentan el grosor. Ventanas añaden montante central dentro del hueco; plantilla armario reutiliza piezas.

## Interacción y presentación — actualización2026-09-22
`doorAngleAtPoint` transforma el punto de ratón en swing.angleDeg (0–180) con bisagra/sentido existentes. Plan2D ofrece círculo accesible; Scene3D usa raycasting contra hoja y plano horizontal del punto inicial. Ambas emiten onDoorAngle al mismo upsertOpening y history begin/end. Hoja/arco solo visuales; collisionWarnings no los incluye. `camera-framing.ts` calcula encuadre independiente comprobado por proyección de esquinas. Scene3D recibe foco para WASD; mueve cámara y target juntos a20cm por pulsación/repetición. Techo opcional más contorno, corte de paredes según cámara. RoomEditor organiza Archivo/Ayuda/selección; opciones de puertas y ayudas de formularios plegables. Estado de paneles/cámara no se persiste; geometría/ángulo sí.

## Contornos V11
geometry/outline.ts deriva marcos de pared (origen,tangente,normal interior,longitud). room.ts corta muros/huecos en marcos locales y transforma al mundo; floor/ceiling poligonales usan ExtrudeGeometry. Plan2D usa el mismocontorno. collisions/outline.ts comprueba centro interior y penetración de borde en huellas de piezas mediante rectángulo/elipse analíticos. No infla curvas. domain/room-shape.ts cambia contorno con reasignación explícita de huecos; ui/RoomShapeEditor permite dibujo y coordenadas/teclado. domain/presets.ts y ui/PresetLibrary instancian plantillas y estructuras.

U5: geometry/drawing.ts contiene snap/proyección/cierre/validación de borrador. RoomShapeEditor mantiene historial temporal y no muta el proyecto hasta Aplicar. ObjectThumbnail usa createObjectGroup compartido con room-meshes; SVGRenderer se ejecuta una vez por firma geométrica, liberando recursos. No texturas ni contexto WebGL por tarjeta.
