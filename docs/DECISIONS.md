# Decisiones

## D001 — Alcance del primer hito
Habitación rectangular, 2D/3D, medidas y guardado. Se posponen muebles y fotos hasta comprobar la base. El usuario pide avances por fases, sin completar precipitadamente.

## D002 — React + TypeScript + Three.js directo + SVG
Se usa el starter React/Vinext verificado por el entorno de publicación y QA. No se añade React Three Fiber: Three directo basta para una escena y reduce dependencias nuevas. El starter trae utilidades no utilizadas que no se eliminan rutinariamente. Interfaz clara de trabajo, azul oscuro y plano técnico sin fotografías decorativas inventadas.

## D003 — Centímetros y procedencia explícita
manualCm > estimatedCm > defaultCm. Los valores iniciales son ejemplos, no una medición ni una inferencia sobre la habitación del usuario. Las dimensiones interiores definen suelo y paredes. Formulario atómico, errores sin geometría parcialmente inválida.

## D004 — Datos locales
IndexedDB y exportación JSON. Sin cuentas propias ni servidor de datos. Código del sitio persistido en Git remoto; datos de la habitación almacenados por navegador. Guardado fallido se comunica; no declarar éxito antes de completar transacción.

## D005 — Reconstrucción incremental y honesta
Primero geometría paramétrica medida, luego fotos y texturas, y normalización de GLB. COLMAP es candidato opcional para procesamiento en un PC capaz. NeRF/splats se posponen: no proporcionan por sí solos objetos separados y editables con colisión. Meshy multivista es candidato externo, sin contratación ni conexión ahora. No exponer claves en frontend; exigir puente servidor seguro si se incorpora. Más detalles en RESEARCH.md.

## D006 — Protección frente a formatos futuros
Rechazar versiones o entidades no soportadas en importación. No recortar, coaccionar ni descartar datos silenciosamente. Migraciones antes de ampliar esquema.

## D007 — Compatibilidad 3D sin GPU comprobada en ejecución
El navegador de QA devuelve GL_RENDERER=Disabled. Se añade SVGRenderer oficial de Three como fallback automático: misma escena, mallas, perspectiva y OrbitControls. Sin texturas, sombras ni líneas de suelo (artefactos de ordenación SVG). WebGL2 sigue siendo la ruta principal en equipos compatibles. Este modo no se presenta como fotorrealista. UUID v4 mediante getRandomValues para admitir preview HTTP sin randomUUID.

## D008 — Huecos estructurales medidos y migración V2
Puertas y ventanas son aperturas en paredes, con medidas de hueco (no luz libre tras marco). Cada ancho/alto/desplazamiento/cota conserva fuentes. Las puertas empiezan en suelo. Offset crece hacia la derecha en A/C y hacia abajo en B/D del plano. Validar solapamiento en el plano de la pared, permitiendo huecos apilados sin intersección. Rechazar reducciones de habitación que invaliden huecos; no escalar medidas manuales. V1 se migra sin cambiar IDs, fechas ni dimensiones; formatos desconocidos se rechazan. Los marcos son aproximados y la hoja móvil de puerta no se modela en F4.

## D009 — Segmentación geométrica
Descomponer la pared en sólidos por cortes en los extremos de cada hueco y intervalos verticales complementarios. No añadir CSG ni aparentar huecos con planos superpuestos. Plano 2D representa todos los huecos de forma esquemática, independientemente de la altura del alféizar. Se comprueba conservación de volumen en las cuatro paredes.

## D010 — Objetos medidos y colisiones V3
Prismas medidos explícitamente aproximados, sin fotos ficticias. SAT horizontal con intervalos verticales y barrido continuo de traslación al arrastrar. Contacto permitido con tolerancia 1e-6 cm. Límites interiores conservadores incluso ante puertas: ningún objeto sale de la habitación. Marcos y vidrio actuales permanecen fuera del interior; esos límites impiden penetrarlos. No se modelan soporte/gravedad ni hojas móviles.

## D011 — Edición libre solicitada
El usuario cambia la política: permitir superposición y salida de límites, con aviso rojo derivado. La validez de formato/medidas y de huecos estructurales sigue siendo obligatoria. V4 incorpora grupos planos reversibles con piezas preservadas y ocultación visual persistida. Ocultar no elimina presencia física ni avisos; piezas del mismo grupo forman una unidad y no avisan de solapamiento interno.

## D012 — Elevación e historial
V5 añade initialHeightCm; nuevos objetos capturan alto de creación, antiguos migran con alto efectivo actual (no existe historial de creación previo). Elevación mueve baseZ sin alterar dimensiones. Historial local de sesión, máximo100 pasos; arrastres2D/3D como transacciones. Portapapeles interno para piezas/conjuntos, IDs nuevos al pegar, offset10cm acumulativo. Atajos se excluyen en campos/diálogos para conservar edición nativa.

## D013 — varias habitaciones y edición visual aprobadas
El usuario amplía explícitamente el alcance a habitaciones independientes. Colección local, sin cuentas ni casas. Miniaturas derivadas del plano, importación añade copia sin sobrescribir, eliminación confirmada. No requiere V6 del Project; envoltorio de colección version1. Historial/clipboard se reinician al cambiar habitación. Ampliar es priorizar una vista en la página, sin Fullscreen API.

## D014 — recolocación estructural
Puertas/ventanas se arrastran sobre la pared en plano; panel cambia pared, posición y cota de ventana. Conservan tamaño y validación de huecos. Iconos de ampliar/restaurar sustituyen botones de texto duplicados.

## D015 — Revit realista
Autorizado catálogo Revit y complemento independiente. Web no interpreta RFA: conserva original y espera manifiesto procesado. ProjectV6 guarda bindings y catálogo completo; medidas manuales mandan. Cajas aproximadas hasta fase de mallas. Originales base64 limitados preservan copia portable sin introducir almacenamiento externo. Asistente local de reglas explícitas, sin atribuir inteligencia multimodal. Revit2026/net8 baseline ajustable; falta entornoWindows/.NET/API para validar complemento. Importador omite incompatibilidades con informe; snapshot exportado NO captura cambios hechos en Revit.

D016 — Validación de originales grandes: patrón base64 lineal y longitud múltiplo4, evitando repetición de grupos que desbordaba pila con8MB. Regresión ejecutada. Complemento usa nombre temporal SHA256 del contenido y comprueba unidades/tipos reales del parámetro antes de aplicar valores. Su verificación API sigue pendiente Windows.

## D017 — Pendientes visuales solicitados (2026-09-21)
F5.5 registra silueta/hoja de puerta abierta y arco en plano, más incrementos de giro45°/90° conservando15°. El usuario solicita incorporarlos a pendientes; no desplegar una implementación ahora. La visualización del arco no acredita detección física de su barrido. Se mantienen medidas prioritarias, estructura separada, grupos y avisos sin bloqueo.

## D018 — Gratuidad y comodidad en fotos→objeto (propuesta2026-09-21)
El usuario prioriza uso personal gratuito, admite instalación/cálculo local y pide comparar opciones. Se recomienda reutilizarUI/modelo con modo local y servicio loopback, visiónOllama y generadores paramétricos, importaciónGLB/escaneos opcionales. Lens manual y GeminiFreeTier no son base garantizada ni motores locales. No ejecutar código arbitrario deIA; propuestas JSON revisables. Manual siempre prevalece; medidas de ficha llevan fuente/variante y confirmación. Esta decisión es de planificación: hardware, calidad y arranque local pendientes de pruebaL0. No se conecta ni contrata servicio. FREE_PHOTO_PIPELINE.md sustituye las candidaturas de pago deD005 para el flujo base.

## D019 — Orden por dependencias y equipo confirmado (2026-09-21)
Portátil RTX 3050 Laptop + i7-12700H declarado; RAM/VRAM/SO desconocidos. Evaluar primero visión2B ligera y geometría por piezas; no tomar tamaño de descarga como consumo VRAM ni prometer latencia. TRELLIS.2 no es base viable según requisitos oficiales; escaneo es opcional. La integración local espera decisión explícita del usuario, que pidió veredicto antes de proceder.
Separar giros, puertas, obstáculos, assets, fotos, GLB, generadores e IA en incrementos verificables. Compartir almacenamiento/representación antes de conectar motores. Mantener Revit independiente y análisis de habitación como requisito pendiente explícito. La siguiente versión de esquema no se reserva para fotos: se asigna al próximo cambio incompatible, con migración incremental y adaptación del contrato Revit. Ningún cambio funcional en este checkpoint.

## D020 — Apertura explícita y límite de sesión
Usuario autoriza mejoras y base de assets pero excluye importación de fotos/GLB. RAM16GB confirmada. V7 incorpora swing opcional: no inventar bisagra/sentido de puertas guardadas o familias Revit. Hoja rectangular usa medidas efectivas del hueco y grosor editable; es aproximación, no carpintería detallada. El arco representa apertura visual, no barrido de colisión.

## D021 — Fijos y colisiones de hoja
V8 agrega obstáculos definidos manualmente por el usuario, separados de muebles y aperturas; no se arrastran ni borran con acciones de mueble. Se pueden modificar exactamente en su editor. Solapamientos y salida de habitación son avisos, nunca bloqueos. Hoja aproxima ancho/alto del hueco; arco no es volumen de colisión. No se modela aún barrido continuo ni apoyo/gravedad.

## D022 — Base de assets sin comenzar importación fotográfica
V9/DB2 separan binarios, mantienen RFA embebido compatible y añaden copia propia sencilla sin ZIP/dependencia de compresión. SHA256 incremental @noble/hashes2.0.1 funciona también en preview HTTP; fake-indexeddb6.2.4 solo pruebas. Restaurar es atómico y conserva habitación actual ante error. Límites32MB/archivo,128MB/proyecto,40MB/manifiesto. Limpieza de huérfanos aplazada para preservar undo y blobs compartidos. Descarga con enlace explícito tras preparación; cloud no entregó archivo/evento, criterio pendiente y F7a no se marca DONE. No hay ingress de fotos/GLB ni motor IA.

## D023 — Piezas y plantillas antes de fotos/GLB
Autorizado22sept: composición procedural genérica y cuatro plantillas. V10 conserva objetos caja y añade compound con1–32piezas. Piezas normalizadas al tamaño medido, editor muestra cm. Redimensionado general proporcional explícito; articulación elevable pendiente P4. Caja exacta; cilindro vertical/elíptico y elipsoide usan prisma elíptico conservador de32lados para colisiones (<0.5% radial); elipsoide no tiene contacto curvo vertical exacto. Mismo generador alimenta plano/Three/colisiones, identidad del objeto intacta. Fotos/GLB/IA siguen excluidos.

## D024 — Corregir falsos positivos de curvas sin cambiar medidas
La aproximación V10 inflaba círculos y llenaba esquinas verticales de elipsoides. Se sustituye por soporte analítico de caja/cilindro elíptico/elipsoide y GJK con simplex de distancia mínima; AABB/OBB amplia y SAT de cajas se conservan. Margen2e-6cm para no marcar tangencia; límites de habitación por extremos analíticos.96 iteraciones máximo, si no converge no inventa colisión. No nuevo esquema/dependencia. Armario es plantilla de8piezas. Puertas/ventanas permanecen estructurales; detalles de panel/manilla son dibujo superficial, no volumen añadido; montante de ventana se aloja dentro del hueco existente.

## 2026-09-22 — Referencia de puerta y edición accesible
El usuario pide excluir expresamente la apertura de las colisiones: se elimina la hoja del conjunto de obstáculos, en cualquier ángulo; el arco tampoco colisiona. No cambia la validación del hueco estructural ni los avisos entre muebles/fijos/límites. Ratón calcula ángulo en el semiplano definido por bisagra/sentido, sin alterar medidas. Captura de puntero e historial agrupan cada arrastre en un paso. En3D se desactiva OrbitControls durante apertura. WASD solo actúa con foco en el visor y sin modificadores, preservando formularios/atajos. Cámara encuadra la esfera de todos los límites visibles con margen según ambos ejes del frustum; recalcula al redimensionar o Centrar. Techo oculto inicialmente para ver interior, contorno superior visible. Ayuda y Archivo reúnen información secundaria sin quitar funciones. Sin dependencias ni migración nueva.

## Contornos y biblioteca autorizados — V11
El usuario amplía alcance a polígonos simples, diagonales y entrantes. Máximo32esquinas, paredes≥10cm, sin cruces ni agujeros interiores. Coordenadas normalizadas a origen superior izquierdo. VérticeUUID identifica pared saliente; huecos usan eseID. Rectángulos antiguos conservan north/east/south/west. Manual ancho/fondo escala contorno explícitamente; huecos no se reducen y cambios incompatibles se rechazan. Biblioteca ahora autorizada: dimensiones de ejemplo revisables; fijos separados y protegidos. Puerta sigue sin colisión con muebles, pero su eje de hoja se limita al primer encuentro con otra pared en su barrido. El complemento Revit conserva soporte rectangular y rechaza explícitamente polígonos hasta implementar esa rama enWindows. No convertir silenciosamente a rectángulo.

### QA V11
Presets usan pointer capture para drag y click/Enter como alternativa. Invertir un contorno con huecos exige revisar anfitriones antes de guardar. Parsear V11 limita apertura a pared también tras cambios geométricos. Cambiar posición no confirma silenciosamente dimensiones de ejemplo. Revit rechaza polígonos; no construir un rectángulo sustituto.

### U5 — construcción y biblioteca visual
Referencias oficiales consultadas: https://www.sweethome3d.com/users-guide/ (paredes encadenadas por clic, edición contextual, catálogo por categorías) y https://cdn.floorplanner.com/static/brochures/FloorplannerManualEN.pdf (barra de herramientas, biblioteca visual, propiedades de selección). Se adoptan patrones de interacción con diseño propio, sin copiar código/assets ni marcas. Miniaturas SVGRenderer derivadas de createObjectGroup compartido con visor, sin WebGL adicional ni productos ficticios. Dibujo tiene borrador/historial local; Aplicar sigue siendo una operación del historial de proyecto. V11 sin cambio de esquema.
