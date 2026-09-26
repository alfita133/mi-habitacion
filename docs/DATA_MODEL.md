# Modelo de datos — V11

Resumen vigente en [ARCHITECTURE.md](../ARCHITECTURE.md). Las secciones V1–V10 son historia de migraciones; «vigente» dentro de ellas significa vigente en aquella fase. Política actual: muebles fuera de límites/solapados permitidos con aviso, hojas sin colisiones, contornosV11, curvas GJK. Los esquemas históricos se conservan para validar importaciones antiguas.

## Proyecto
`Project`: schemaVersion:11, assets:AssetReference[], families:RevitFamily[], groups:Group[], id UUID, name, unit:'cm', createdAt/updatedAt ISO UTC, room, objects:MovableObject[], photos:[], models:[]. Esquema Zod estricto. Fotos y modelos raíz continúan vacíos hasta sus fases; no aceptar ni descartar silenciosamente entidades desconocidas.

`Room`: id, shape:'rectangle'|'polygon', vertices opcional (obligatorio para polygon), dimensions:{width,depth,height}, wallThicknessCm, wallColor, floorColor, fixedElements:Opening[], fixedVolumes:FixedVolume[]. Medidas interiores. Ancho/fondo 50–2000 cm, alto 50–1000 cm, grosor 1–100 cm. Los límites son restricciones del prototipo, no recomendaciones.

`Measurement`: defaultCm:number, estimatedCm:number|null, manualCm:number|null. Valor efectivo manual > estimación > ejemplo. Validar todos los valores almacenados, no solo el efectivo. Cero permitido en posiciones, no en dimensiones. No admitir NaN o infinitos. Cambiar un nombre no convierte las estimaciones en medidas reales.

## Elementos estructurales implementados
`Opening`: id UUID, kind:'door'|'window', name (1–80 caracteres), wallId cardinal para rectangle o UUID de arista para polygon, width, height, offset, sill (todos Measurement). Máximo 64 por habitación.
- width: ancho del hueco completo (1–2000 cm), no luz libre entre marcos.
- height: alto del hueco (1–1000 cm).
- offset: posición desde el inicio de la pared (0–2000 cm).
- sill: cota inferior sobre suelo (0–1000 cm). Puerta: valor efectivo 0 obligatorio.
- Pared A/north es arriba del plano y C/south abajo: offset crece de izquierda a derecha.
- Pared B/east es derecha y D/west izquierda: offset crece de arriba hacia abajo.
- No se supone orientación geográfica real de la habitación.

Validar que offset+width ≤ longitud de pared y sill+height ≤ alto. No admitir IDs duplicados ni intersección de dos rectángulos de hueco en la misma pared. Se permite contacto de bordes y huecos apilados sin intersección vertical. Al reducir habitación, rechazar cambios que invaliden un hueco existente; no mover ni escalar medidas reales automáticamente.

Puertas sin swing se representan como hueco y marco; con swing añaden hoja móvil; ventanas como hueco, marco y vidrio aproximado. Los marcos tienen ancho visual de hasta 3 cm, reducido proporcionalmente en huecos pequeños. Su geometría NO sustituye las medidas del hueco. La hoja y el arco son referencia visual y no colisionan con muebles; el límite de apertura frente a paredes usa el eje de hoja (`maxDoorAngle`).

## Geometría derivada
`Box`: id, wallId opcional, center:{x,y,z}, size:{x,y,z}. Centímetros y Z vertical en dominio; Three usa (X,Z,Y).
`roomGeometry`: walls (sólidos segmentados alrededor de huecos), planWalls (representación esquemática cortada a lo largo de todos los huecos), structural (marcos y vidrio con openingId/kind), floor, ceiling, dimensiones, área/volumen interiores.
Las paredes se extienden hacia fuera del interior y los marcos permanecen dentro del hueco medido. Suelo Z=0; techo Z=alto. Cambiar visibilidad de corte/techo no cambia el dominio ni los sólidos físicos.

## Migración histórica V3 (contrato vigente V6 documentado al final)
`projectV1Schema` conserva el contrato original de habitación vacía. `parseProject` valida V1 y lo convierte a V3 cambiando únicamente schemaVersion. IDs, fuentes de medidas y fechas se mantienen; V1 con elementos inesperados se rechaza. IndexedDB conserva DB version 1 porque la estructura del object store no cambia: solo migra el contenido a través de parseProject. JSON importado utiliza la misma función. V2 se valida con projectV2Schema antes de convertirse a V3. Guardado posterior escribe V3. Las copias V2 no abren en versiones antiguas de la app.

## Contratos futuros, todavía NO implementados
- Evolución de MovableObject: referencia modelId a assets externos y photoIds no vacíos; contrato actual al final.
- Photo: id, owner roomId|objectId, assetId, filename, mime, widthPx/heightPx, angle, createdAt. Original inalterado y copia normalizada separada.
- Model: id, kind procedural/glb, assetId, source, nativeBounds, normalizedTransform, materiales/texturas, calidad/limitaciones.
- AnalysisProposal: proveedor, fotos, hipótesis/confianza y estimaciones revisables; nunca modifica manualCm.
- ReconstructionJob: estados reales pending/running/succeeded/failed/cancelled, proveedor, entradas, resultado y error.
Assets binarios en IndexedDB, referenciados por ID. Antes de admitirlos, implementar copia con manifiesto y blobs. No llamar al JSON actual una copia completa de futuras fotos/modelos.

## Contrato histórico de objetos V3
MovableObject: id UUID, name/category 1–80 caracteres, position{x,y,z} centro XY/base Z en cm, rotationDeg[0,360], dimensions{width,depth,height}:Measurement[1,2000], model{kind:'box',source:'manual-approximation'}, material{color:'#rrggbb',textureId:null}, photoIds:[]. Máximo100. Modelo procedural embebido; futuros assets requieren migración. Editar metadatos conserva fuentes de medidas no tocadas. No son reconstrucciones fotográficas.
Project se valida completo en cada operación, importación y guardado. Colisiones rechazan solapamientos de prismas, incluso rotados, si coinciden intervalos Z. Contacto permitido (1e-6 cm). Redimensionar habitación/objeto no desplaza entidades automáticamente. Posiciones importadas finitas y sujetas a límites. No se permite ocupar huecos fuera del interior.

## Contrato vigente V4 (sustituye rechazo físico de V3)
MovableObject conserva todos los campos y añade hidden:boolean, groupId:UUID|null. Group{id:UUID,name:string[1,80]}; project.groups máximo50. Cada grupo al menos2 piezas, IDs únicos y referencias válidas. No grupos anidados. Transformar conjunto modifica posiciones/giro de piezas conservando dimensions/IDs/materiales. Ocultar no afecta geometría ni física. Colisiones internas de una misma unidad no se notifican; colisiones contra otras unidades se comprueban por piezas, no por envolvente del grupo.
V1/V2/V3 se validan con esquemas históricos y migran a V4 añadiendo groups:[], hidden:false y groupId:null a objetos. V4 permite superposición y posiciones fuera de límites (números finitos), incluso al importar/guardar. Dimensiones y huecos estructurales siguen validados. Map de avisos derivado y selección UI no se persisten. V4 no abre en editores antiguos.

## Contrato vigente V5
MovableObject añade initialHeightCm:number[1,2000] finito, capturado al crear y conservado al editar/copiar/agrupar. Reset asigna manualCm de height sin moverZ. MigracionesV1–V4 toman alto efectivo actual como baseline: no existe medida de creación histórica. projectV4Schema conserva validación anterior. History{past,future,gesture} y ObjectClipboard{objects,groupName} no se serializan; proyecto aplicado sí tras undo/redo.

## Colección local F5.3
RoomCollection {version:1,activeId:UUID,projects:Project[]}; al menos uno, IDs únicos, activeId existente. DB mi-habitacion/store projects/key collection. Migración única desde current validada y atómica, original conservado. Project V5 JSON sigue portable por habitación; importar/duplicar crea project.id y room.id nuevos, referencias internas preservadas (IDs de piezas tienen ámbito de proyecto). La selección múltiple no se persiste.

## Contrato vigente V6 — Revit
Project schemaVersion6 añade families:RevitFamily[] (máximo40). Objects y fixedElements admiten revit?:{familyId,typeId,parameters:Record<string,string|number|boolean>}. Referencias/valores se validan; parámetros readonly/unsupported no se modifican. Familias pending conservan originalBase64 y no admiten tipos ni colocación; processed contiene tipos, parámetros tipados/unidades, miniatura PNG, dimensiones bbox opcionales y mapas dimensionales. Originales se incluyen en JSON; no se almacenan rutas como acceso concedido. Ver integrations/revit/CONTRACT.md. MigracionesV1–V5 añaden families vacío; formatos antiguos no aceptan bindings futuros silenciosamente.

## Propuesta fotos/modelos gratuitos — contrato aún por diseñar
No cambiarV6 por esta investigación. Próxima evolución debe guardar fuente de dimensiones (manual/ficha comercial confirmada/estimación), URL/variante/unidades, fotos originales y malla/receta paramétrica con estado de calidad. Sustituir representación conserva object.id/posición/grupo/bindingRevit; una malla no es automáticamente una familiaRFA. Assets y copia portable/migración deben existir antes de aceptar datos. Ver FREE_PHOTO_PIPELINE.md.

## Orden de evolución histórico (sustituido por V7–V9 abajo)
En la planificación anterior V6 era el contrato actual. F5.5a giros no añade datos; F5.5b requerirá estado de apertura/bisagra/sentido y una migración antes de persistirlo. F6 incorporará obstáculos clasificados manualmente. Assets, recetas y procedencia de medidas llegarán después. Cada cambio incompatible toma la siguiente versión libre (no reservar V7 para fotos ni cargar campos futuros ahora). Mantener pruebas V1–V6 y versiones intermedias; adaptar el intercambio Revit cuando cambie el esquema, sin asumir que el complemento antiguo interpretará campos nuevos. Contratos definitivos por diseñar en cada incremento.

## V7 — apertura de puertas
Opening admite swing opcional {hinge:start|end, direction:inward|outward, angleDeg:0–180, thicknessCm:0.5–20}. Inicio/final siguen offset de pared, no orientación geográfica. Ausencia significa apertura desconocida, sin hoja ni colisiones de hoja. Ventanas rechazan swing. Nuevas puertas en formulario proponen90°/inicio/interior/4cm, editables antes de guardar; puertas Revit no inventan esos datos. Hoja rectangular aproximada de ancho/alto efectivos del hueco, pivote en cara interior. V1–V6 migran aV7 conservando campos,IDs/fuentes y ausencia de swing. El contrato V6 estricto sigue rechazando datos futuros.

## V8 — obstáculos interiores
room.fixedVolumes: FixedVolume[] máximo64. Cada volumen {id UUID,name,position{x,y,z},rotationDeg,dimensions{width,depth,height}:Measurement,color}. CentroXY/baseZ; medidas1–2000cm, rotación0–360, posición finita. No grupos/ocultación/clipboard de muebles; edición estructural y borrado confirmado. IDs únicos entre objetos,huecos y volúmenes. V1–V7 migran con fixedVolumes vacío sin alterar fuentes. Volúmenes fuera de límites o solapados se guardan con aviso, igual que muebles. Colisiones de puertas usan su hoja rectangular actual y altura, no el barrido del arco.

## V9 vigente — referencias y copia completa
Project añade assets:AssetReference[], vacío al migrar V1–V8. Referencia {id UUID,fileName,mimeType,byteLength,sha256}; SHA256 hex minúscula64, máximo128 referencias,32MB por archivo,128MB sumados por proyecto. Mismo contenido puede tener IDs distintos; binarios se deduplican por hash. Las asociaciones Photo/Model aún NO existen; photos/models/photoIds continúan vacíos. No se interpreta el contenido de assets.
DB mi-habitacion version2 añade store assets sin borrar projects/current. Colección conserva version1. Copia .habitacion.pack: magic ASCII ROOMPK01 (8bytes), longitud uint32LE manifiesto (4bytes), JSON UTF8 {format:habitacion.backup,version:1,project,files}, binarios concatenados en orden files y deduplicados por hash. Manifiesto máximo40MB y assets128MB; rechazar corrupción, referencias faltantes, bytes extra o truncados. No ZIP ni rutas extraídas. Abrir copia restaura binarios+colección en una transacción antes de cambiar UI.
JSON histórico sin assets sigue abriendo. JSON con referencias externas exige .pack para no perder binarios. Originales RFA siguen embebidos por compatibilidad Revit. No GC de assets todavía: pueden quedar blobs sin referencia después de borrar habitaciones, hasta diseñar limpieza compatible con historial y referencias compartidas.

## V10 vigente — objetos compuestos
`model` de objeto: caja histórica o `{kind:'compound',source:'manual-approximation',parts:Part[]}` (1–32). Part: id UUID local al objeto, name, shape box|cylinder|ellipsoid, x/y relativos al centro del padre (-.5..+.5), z relativo a su base (0..1), width/depth/height (.0001..1), rotationDeg (0..360 alrededor de Z). Tamaños y posiciones se multiplican por las dimensiones efectivas, manuales prioritarias. El editor convierte a cm. No hay inclinación X/Y ni booleanos CSG. Piezas pueden solaparse internamente sin avisos; conjunto físico es su unión. IDs repetidos dentro del objeto se rechazan; copiar objeto conserva IDs locales.
Validación garantiza piezas dentro de la envolvente medida, incluida proyección rotada y altura. Redimensionado es proporcional por ejes; con piezas giradas puede invalidar límites, en cuyo caso se rechaza sin recortar. `projectV9Schema` estricto conserva contrato anterior. V1–V9 migran a V10 sin cambiar representación caja ni inventar huecos. DB2/colección1/pack1 no cambian.
Colisiones: broad phase OBB de envolventes; narrow phase SAT de huellas de piezas e intervalos Z. Cajas exactas, cilindros verticales/elipses con polígono circunscrito32lados (<0.5% radial adicional), elipsoides con mismo prisma conservador de alto completo. Los huecos entre piezas quedan libres; no se prometen colisiones exactas de almohada curvada, rejilla ni aspas individuales. Invisibilidad sigue física y grupos omiten colisiones internas como antes.
Plantillas iniciales sin marca/producto: escritorio (tablero,2patas,2pies,travesaño), cama (estructura,colchón,cabecero,almohada,4patas), estantería (2laterales,5baldas), ventilador (base,soporte,cabezal), personalizado (1caja). Proporciones son aproximaciones revisables, no mediciones de componentes.

## Corrección V10 sin migración (22sept)
Sustituye descripción previa de prisma conservador: cilindros/elipsoides usan volumen curvo3D analítico mediante GJK, contacto permitido con tolerancia. No campos nuevos; todas las habitaciones V10 reciben la corrección al cargar. Armario:2laterales,suelo,techo,fondo,2puertas,balda. Plantilla inicial cerrada, piezas editables manualmente; sin articulación automática. Detalles puerta y montante ventana son derivados; no cambian medidas ni bindings.

## Política vigente2026-09-22 — no cambia V10
Opening.swing.angleDeg sigue persistido (0–180°). Ratón2D/3D y controles numéricos usan el mismo dato. La hoja es referencia visual, nunca obstáculo (también cerrada); el sector no colisiona. No se añade estado de cámara, foco WASD ni paneles al proyecto. Cargar versiones anteriores conserva su apertura, con la nueva política visual.

## V11 — contorno editable
room.shape rectangle|polygon; vertices opcional, requerido para polygon: {id UUID,x,y}[],3–32. Cadaid identifica pared de ese vértice al siguiente. Coordenadas0–2000cm, origen mínimo0 en ambos ejes, envolvente debe coincidir con dimensions.width/depth. Contorno simple horario; sin segmento<10cm ni aristas no adyacentes que se toquen. Opening.wallId conservaIDs cardinales de rectangle oUUID de pared poligonal. EsquemasV1–V10 se validan antes de migrar, sin inventar contorno. DB2/colección1/pack1 permanecen. Presets no se guardan como referencias: instancian objetos/huecos/fijos existentes conIDs propios y dimensiones de ejemplo.

U5 no modifica V11. Cursor, ajuste de cuadrícula, historial del trazado y filtros de biblioteca son estado efímero de UI; el proyecto guarda solo el contorno aplicado y objetos existentes.
