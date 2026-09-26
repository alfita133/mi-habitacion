# Arquitectura real actual

Auditoría26-09-2026, contrato ProjectV11. Describe código existente; propuestas futuras se separan al final. `REQUIREMENTS.md` expresa requisitos, `PROJECT_STATUS.md` acredita avance/bugs. `docs/DATA_MODEL.md` conserva migraciones y detalles históricos.

## Plataforma y entrada
Aplicación React19/TypeScript con entrada `app/page.tsx` → `src/ui/RoomEditor.tsx`; estilos globales `app/globals.css`, componentes de interfaz `components/ui`. Vinext sobre Vite8, configuración Next compatible y adaptador Cloudflare para Sites. Three0.180 para geometría/render, Zod3 para contratos. No React Three Fiber ni motor físico externo.
El starter incluye módulos de autenticación Sites, D1/Drizzle y ejemplos. El editor de habitaciones usa IndexedDB, no cuentas propias ni esas tablas para su proyecto. No confundir infraestructura heredada con funcionalidades del dominio.
`package.json` fija pnpm11.25, Node>=22.13. `scripts/run-framework.mjs` elige portable/Vite gestionado con `execution-profile.mjs`. En clon limpio, sin `.sites-runtime/execution-profile.json`, usa portable: Vinext y puerto5173. Perfil local no debe versionarse. `.openai/hosting.json` identifica el Site existente, no es almacén de credenciales.

## Recorrido de una edición
1. `useProject` carga `RoomCollection` de IndexedDB. `RoomEditor` crea `RoomSession key=project.id`: selección, clipboard, historial y cámara se reinician al cambiar de habitación.
2. UI prepara una operación sobre `Project`; formularios de forma/piezas mantienen borrador hasta Aplicar/Guardar. Dominio puro valida propuesta completa con Zod.
3. `useEditorHistory.update` registra estado anterior; begin/end agrupan cada arrastre. Undo/redo vuelve a guardar el proyecto aplicado.
4. `useProject.setProject` sustituye el proyecto en colección y programa escritura serial. React distribuye el mismo `room` y `objects` a Plan2D/Scene3D.
5. Geometría y avisos se derivan de datos efectivos. Los renderizadores emiten callbacks, no son almacenes de datos alternativos.
6. IndexedDB confirma guardado al finalizar transacción; UI muestra errores y permite exportar. Importación aplica colección a UI solo tras guardado atómico.

No hay Redux/Zustand, servidor de habitaciones, colaboración en tiempo real ni sincronización de dispositivos.

## Dominio y contratos
- `src/domain/model.ts`: esquemasV1…V11, `parseProject`, operaciones de medidas/objetos/huecos y creación de ejemplo vacío400×350×260cm. Valores de ejemplo no son medidas reales.
- Project: id/nombre/fechas/unit, room, objects, groups, families, assets, photos y models. `photos`/`models` vacíos por contrato vigente.
- Measurement: defaultCm, estimatedCm nullable, manualCm nullable; efectivo manual→estimación→ejemplo. No sobrescribir procedencia al editar solo nombre/posición.
- Room: dimensions interiores, wallThicknessCm, colores, shape rectangle|polygon, vertices según forma, fixedElements (puertas/ventanas), fixedVolumes.
- MovableObject: id/nombre/categoría, position, rotationDeg, dimensions, initialHeightCm, hidden, groupId, model box|compound, material.color/textureId:null, photoIds:[], binding revit opcional.
- Part: primitive box|cylinder|ellipsoid y dimensiones/posición normalizadas respecto a padre, giroZ. `parts.ts` valida piezas dentro de envolvente, hasta32. `templates.ts` proporciona recetas aproximadas; `PartsEditor` convierte cm↔normalizado.
- Groups: referencias planas, no jerarquía/CSG; `groups.ts` conserva piezas al transformar. `selection.ts` evita transformar un grupo dos veces. `clipboard.ts` clona IDs preservando forma/binding/alto inicial. `history.ts` contiene snapshots hasta100, solo memoria.
- `rooms.ts`: colecciónversion1 con activeId y proyectos; clonar habitación cambia identidad del proyecto/habitación sin romper referencias internas.

## Coordenadas
Dominio cm, +X derecha, +Y abajo/profundidad, +Z vertical. Origen mínimoX/mínimoY del contorno a nivel del suelo. XY mueble centro, Z base. En polígonos cóncavos el origen de envolvente puede quedar fuera del área útil.
Three tiene Y vertical: `(x,z,y)`, `rotation.y=-rotationDeg*pi/180`; mallas se centran a `baseZ+alto/2`. Revit pies `(x,-y,z)/30.48`, giro negativo en radianes. Medidas habitación interiores; espesor de pared hacia fuera.

## Contorno, paredes y puertas
`geometry/outline.ts`: contorno horario simple y marcos locales de pared (inicio, tangente, normal interior, longitud). Para rectangle usa IDs north/east/south/west; para polygon el UUID de vértice identifica arista saliente.
`domain/room-shape.ts`: normaliza mínimoXY a0, establece ancho/fondo de envolvente y reasigna explícitamente huecos. No recoloca muebles automáticamente. `setManualDimensions` escala contorno al cambiar medidas generales. Huecos con medidas incompatibles invalidan operación, no se recortan.
`RoomShapeEditor` tiene borrador local/historial/cursor/zoom/snap. `geometry/drawing.ts` es puro: ajuste libre/5cm/Shift ortogonal, rechazo de cruce, cierre y proyección de nuevo vértice sobre arista. Aplicar registra una sola modificación de proyecto; cerrar diálogo descarta borrador.
`geometry/openings.ts` corta intervalos de sólidos alrededor de huecos; `geometry/room.ts` transforma de pared local a mundo. Sin CSG externo. Suelo/techo poligonales usan ExtrudeGeometry; marcos/vidrio/detalles son geometría derivada.
`Opening` almacena width/height/offset/sill, anfitrión y swing opcional. `move-opening.ts` mueve sobre pared. `door-leaf.ts` calcula hoja/arco, ángulo del puntero y `maxDoorAngle`; el último busca primer contacto del eje con otra pared. `parseProject` limita apertura tras cargar/cambiar forma. No cubre espesor de hoja en límite, conocido L01.

## Renderizadores y objetos
- `rendering/Plan2D.tsx`: SVG superior, viewBox para incluir objetos exteriores, bloqueo de encuadre durante drag, coordenadas de puntero por matriz inversa, captura, cuadrícula, cotas y controles de teclado. Usa geometría/huellas reales del dominio, no escala visual arbitraria.
- `rendering/Scene3D.tsx`: motor Three creado al montar, PerspectiveCamera, OrbitControls, raycasting por IDs; WASD desplaza cámara/target, flechas órbita, zoom y Home. Actualiza grupo de escena cuando cambian datos; libera recursos y ResizeObserver al desmontar. Handle DOM proyectado controla elevaciónZ. No hay arrastre XY directo de muebles en3D: se hace en2D o campos.
- `camera-framing.ts`: encuadre por volumen/frustum, incluyendo muebles/fijos exteriores visibles. `room-meshes.ts`: mallas comunes, userData objectId/openingId/fixedId, materiales y rojo derivado; corte de paredes según normal/cámara, techo opcional.
- `renderer.ts`: WebGL2 si disponible; SVGRenderer oficial en caso contrario, perspectiva real sin texturas/sombras. UI declara modo compatible. Fallback no acredita QA GPU.
- `geometry/object-parts.ts`: lleva las piezas normalizadas a sólidos globales. `createObjectGroup` lo usa tanto en escena como en `ObjectThumbnail` (miniaturas SVG; sin contextoWebGL por tarjeta).
- `domain/presets.ts` instancia recetas/fijos/huecos con IDs propios y medidas ejemplo; `PresetLibrary` arrastra mediante pointer capture al SVG o añade por clic/Enter. No referencias a productos externos.

## Colisiones
`collisions/objects.ts` deriva Map id→avisos en cada estado. Broad phase envolvente orientada; narrow phase sólidos reales. Cajas SAT+intervaloZ; curvas soporte analítico/GJK en `convex.ts`; límites poligonales en `outline.ts`. Contacto permitido con tolerancia. Huecos entre piezas están libres. No colisión de malla arbitraria.
Objetos ocultos siguen físicos; piezas del mismo grupo no generan avisos internos. Muebles↔fijos, fijos↔fijos y límites considerados. Puertas/hojas/arcos excluidos de avisos: son referencia por decisión expresa. Su límite de apertura geométrico sigue activo.
`projectSchema` valida estructura/formato, no rechaza colisiones de muebles. Función antigua `sweptOverlap` permanece pero no gobierna movimiento actual. No restaurar política de bloqueo por leer comentarios/pruebas históricas.

## UI, selección y accesibilidad
`RoomEditor` orquesta toolbar, Archivo/Ayuda, biblioteca, inspector contextual, cambios de vista y atajos. `ObjectsPanel`, `ObjectTransform`, `HeightControl`, `StructurePanel`, `OpeningPosition`, `DoorSwingFields`, `FixedVolumesPanel` delegan operaciones al dominio. `RoomShapeEditor` y `PartsEditor` aíslan borrador para cancelar.
Estado persistido: geometría, medidas, ángulo, ocultación y grupos. Efímero: paneles abiertos, filtros, cámara, modo vista, selección, borrador, clipboard e historial. Seleccionar3D/2D abre mismos controles; en estrecho se usan pestañas. CSS y ARIA implementan foco/estado; falta auditoría integral de accesibilidad.

## Persistencia y copias
`persistence/database.ts`: IndexedDB `mi-habitacion`, versión2, stores `projects` y `assets`. Clave `collection`; migración desde `current`, que se conserva. Cola de promesas serializa snapshots; colección+blobs en transacción. Bloqueos por otras pestañas/cuota/hash inválido reportados sin confirmar guardado falso.
`domain/assets.ts`: referencias id/name/mime/byteLength/sha256. `persistence/assets.ts` SHA256 incremental con @noble/hashes; binarios deduplicados por hash.
`backup.ts`: contenedor `.habitacion.pack` `ROOMPK01` + uint32LE longitud manifiesto + JSON + binarios. Verifica tamaños/hashes/truncamientos/extras antes de restaurar. No es ZIP; límites128MB total/32MB archivo/40MB manifiesto,128 referencias. Sin recolección de blobs huérfanos aún.
`serialization.ts`: parsea JSON histórico y sobreRevit. Un JSON que solo referencia assets no constituye copia completa: exige pack. `RoomEditor` prepara blob/enlace explícito, descarga y revoca URL.
Infraestructura de assets no significa importación de fotos/GLB: faltan asociaciones Photo/Model y pipeline. Datos reales en IndexedDB no migran mediante cloneGit; exportarlos desde origen anterior.

## Revit: frontera real
`src/revit/schema.ts`: contratos catálogo/manifiesto/binding/parámetros/unidades. `files.ts` acepta .rfa, tamaño/cabeceraOLE y conserva bytesbase64; no interpreta Revit. `FamiliesPanel` gestiona pending→processed con manifiesto externo. `operations.ts` crea caja o apertura, modifica binding, sugiere por reglas y produce `.habitacion.json`.
Código separado `integrations/revit/Habitacion.Revit`:
- `ExtractFamilies.cs`: carga familias en contextoRevit, tipos/parámetros/miniatura y medición temporal compatible; no exporta malla completa web.
- `ImportProject.cs`: estructura rectangular, familias/tipos/instancias, unidades/ubicación/giro/parámetros, verificaciones dimensionales e informe de omisiones; transacciones por instancias para continuar ante fallos.
- `Bridge.cs`: lectura/validación/intercambio, snapshot original. `.addin` registra comandos. `.csproj` parametriza RevitPath/RevitYear/TargetFramework; API propietaria se referencia desde instalaciónWindows.
C# no compilado/probado. V11 poligonal se rechaza antes de crear estructura; no sustituir por rectángulo. Variantes no compatibles e importación repetida/retorno solo snapshot son límites, ver README específico. `public/revit-integration.zip` duplica fuentes/guía: regenerar si se cambian esas fuentes, no si solo cambian estas guías raíz.

## Sistemas futuros (no presentes)
No hay carpetas operativas `image-processing` ni `reconstruction`, inferencia, cámara/scan, importadorGLB o texturas fotográficas. Modelo reserva campos vacíos. Investigación contempla adaptador local Node loopback/Ollama con propuestas revisables y generadores medidos, captura opcional de fotogrametría. Se conserva como diseño provisional y pausa explícita del usuario; no introducir dependencias ni cambiar contrato por anticipación.

## Pruebas, distribución y continuidad
Tests Node `tests/*.test.mjs`, geometríaThree sin navegador y fake-indexeddb; no suite e2e automatizada. QA manual histórica en `docs/TESTING.md`, evidencias `docs/qa`. `PROJECT_STATUS.md` distingue pruebas de dominio, arranque/build y QA pendiente.
GitHub es origen de continuidad Codex; snapshot de Work con historial nuevo, no clon de toda la historia anterior. El editor sigue con despliegueSites conocidoV11; códigoU5 más reciente enGit. No se cambia hosting al migrar el repositorio.
