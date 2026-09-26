# Fotos → objeto utilizable sin APIs de pago

Investigación 2026-09-21. Propuesta técnica, NO implementación ni benchmark en el equipo del usuario. Objetivo: pocas operaciones, uso personal local, sin suscripción ni pago por generación. Reutilizar PC/móvil existentes; electricidad, almacenamiento y tiempos de cálculo propios. La disponibilidad gratuita de servicios externos puede cambiar.

## Decisión propuesta
Conservar React/Three y los datos actuales. Añadir distribución local que abra el mismo editor en navegador y un servicio Node en loopback para Ollama y trabajos opcionales. Evitar Electron, Docker y Python obligatorios en el camino básico. No ejecutar inferencia pesada en Sites/Worker. Validar primero el arranque local portable: no asumir que el servidor actual de producción Cloudflare funciona sin adaptación en Windows. El sitio actual permanece disponible; transferir mediante copia portable, sin prometer sincronización automática.

Ruta básica: varias fotos → visión local → propuesta estructurada revisable → categoría/rasgos → generador paramétrico → medidas confirmadas → sustituir representación del objeto manteniendo su ID, posición, giro, grupos y propiedades. Ollama puede analizar imágenes y producir JSON ajustado a esquema; esto no certifica identificación de marca ni medidas. Probar Qwen3-VL2B/4B según hardware, sin modelos cloud. Descarga de4B aproximadamente3.3GB, que NO equivale a memoria total en ejecución. Confirmado por el usuario: portátil con RTX 3050 Laptop e Intel Core i7-12700H. Confirmados16GB RAM y ASUS TUF Gaming F15; faltan SO y VRAM; no asumir su capacidad a partir del nombre de GPU. CPU posible con mayor latencia; medir antes de prometer tiempos.

Las bases paramétricas (cama, mesa, silla, armario, escritorio, estantería) son generadores internos de piezas, no un catálogo de muebles comerciales a elegir. Producen patas, tablero, respaldo, cajones y huecos según parámetros, en vez de una caja maciza. Rasgos no observables se marcan aproximados y se pueden corregir. Color/material estimado no equivale a textura fotográfica reconstruida. Geometría, materiales y procedencia se guardan; una malla generada nunca se etiqueta como escaneo exacto.

## Comparación de opciones comprobadas
| Opción | Qué aporta | Coste/local | Limitación y encaje |
|---|---|---|---|
| Ollama + Qwen3-VL | Clasificación, OCR de etiquetas, rasgos y propuesta JSON multimagen | Inferencia local sin tarifa por llamada | No busca Internet ni genera malla por sí solo. Ruta base junto a generadores paramétricos; probar acierto/latencia real |
| Google Lens manual | Buscar productos visualmente parecidos y páginas comerciales | Interfaz de búsqueda sin contratar API; envía imágenes a Google | No se ha encontrado una API pública oficial gratuita de Lens para este flujo; no basar la app en scraping. Abrir búsqueda y pegar ficha/URL o captura como alternativa asistida |
| Gemini API Free Tier | Visión mediante API con cuotas/modelos elegibles | Servicio externo, no local; nivel gratuito limitado | Opcional, nunca dependencia de disponibilidad. Cuenta sin facturación y corte al agotar cuota; no activar pago. Análisis de imágenes y grounding/búsqueda tienen disponibilidades distintas |
| RealityScan Desktop | Fotogrametría multivista, texturas, CLI, exportaciónGLB | Gratis bajo condiciones de ingreso<1MUSD/año y educación; cálculo en PC | Captura solapada abundante, escala real, segmentación/limpieza. Validar GPU/versión;2.2 amplía AMD pero no significa todas las Radeon. Buen adaptador detallado opcional |
| Meshroom / COLMAP | Fotogrametría de código abierto | Local, sin tarifa por objeto | Instalación/pipeline más técnico; COLMAP denso estándar requiereCUDA. No prometer rutaCPU completa sin integrar/verificar motor alternativo |
| TripoSR | Generación de malla a partir de una foto | Código y pesos MIT; local | Configuración por defecto~6GBVRAM. Fotos en lote no significan reconstrucción multivista conjunta. Completa partes no visibles, no garantiza medidas |
| TRELLIS.2 | Generación3D con materiales y salidaGLB | Local, repositorio/pesos disponibles | Ruta oficial Linux/NVIDIA≥24GBVRAM. Fuera del camino base hasta conocer hardware; no prometer que funcione en AMD o cualquier portátil |
| Escaneo móvil Scaniverse Classic | Captura/procesado en móvil, alternativa de poca instalación enPC | Experiencia clásica local gratuita | Producto actual también ofrece nube de pago/cuotas. Confirmar modo malla y exportación en versión instalada; splat no sustituye malla editable. No confundir documentación antigua con nueva plataforma |

## Identificación comercial y medidas
1. Leer etiqueta, referencia o marca si existe; combinar vistas para proponer candidatos. Etiqueta fotografiada suele ser más útil para SKU exacto que otra foto general.
2. Si se encuentra una ficha verificable, presentar nombre, variante, enlace y dimensiones del producto montado (no embalaje). Confirmación del usuario antes de aplicarlas; una semejanza visual no valida el SKU.
3. Para búsqueda online gratuita, inicialmente Lens/navegador asistido y pegar URL/texto/captura. El servicio local puede extraer texto accesible de una URL aportada, pero no garantiza acceso a todas las tiendas; usar captura/PDF si la página falla. No afirmar un buscador universal automatizado sin API real.
4. Si no hay ficha ni escala, dejar medidas desconocidas o estimadas; pedir ancho/fondo/alto. Fotos sin referencia no aportan escala métrica absoluta. En fotogrametría una distancia conocida permite escalar una reconstrucción consistente; varias medidas ayudan a comprobarla.
5. Prioridad manual > ficha confirmada > estimación visual. Conservar fuenteURL, variante, unidades y fecha aparte; no promover automáticamente a manualCm. Diseñar migración para esta procedencia antes de modificar el contrato actual.

## Ruta detallada y biblioteca de modelos
Prioridad de representación: modelo existente del producto exacto si disponible/legalmente reutilizable → generador paramétrico medido → escaneo/textura o generación local opcional. No todos los fabricantes ofrecen3D ni toda descarga es gratuita/reutilizable; no hay catálogo externo conectado.
ImportarGLB primero permite usar modelos existentes/escaneos sin esperar toda la IA. RealityScan ofreceGLB; otros exportsOBJ+MTL+texturas necesitarán conversión local. Guardar original intacto y derivado normalizado: cm, centroXY/baseZ, orientación corregida, límites/texturas comprobados. Priorizar ajuste paramétrico; si se deforma malla por ejes para respetar medidas, indicarlo y mantener original. Colisión separada de apariencia; preservar avisos actuales sin bloquear.
Escanear cada objeto por separado facilita aislamiento. La captura requiere solape y distintos ángulos: pocas fotos sueltas no bastan para fotogrametría robusta. Vidrio, espejos, superficies lisas/brillantes, patas finas y traseras ocultas pueden fallar. Una malla visual no se convierte automáticamente en familia Revit paramétrica; esa conversión es otra tarea.

## Integración y comodidad propuestas
Acceso directo futuro abre servicio/editor; asistente comprueba motor/modelo y explica descarga una sola vez. No instalar todos los motores: Ollama para base, fotogrametría opcional. Vista única para fotos, análisis, previsualización, medidas y confirmar. Trabajos con progreso real, cancelación y recuperación. Servicio limitado a loopback, peticiones autenticadas/origen controlado; no exponer Ollama aInternet ni ejecutar código arbitrario generado por IA. Modelo devuelve datos acotados para generadores propios.
Procesar múltiples fotos con IDs por objeto y validación; fallos de una imagen no deben perder originales. Al sustituir cubo por modelo, guardar en una transacción lógica y permitir deshacer. JSON antiguoV1–V6 sigue cargando. Assets binarios enIndexedDB/local + exportación portable con manifiesto, fotos y mallas, antes de admitirlos. La web no puede abrir procesos deWindows directamente; el modo local aporta ese puente. No se migra toda la aplicación sin probar el adaptador local.

## Veredicto para el equipo confirmado — 2026-09-21

Portátil RTX 3050 Laptop + Intel Core i7-12700H. RAM16GB confirmada; ASUS TUF Gaming F15. VRAM y SO todavía no declarados. Ollama incluye RTX 3050 en su matriz de hardware; eso verifica compatibilidad del motor, no calidad/velocidad ni que cualquier modelo quepa en VRAM. Recomendar la ruta de visión ligera + geometría por piezas es una inferencia técnica, no un benchmark.

- Editor 2D/3D y modelos de mobiliario con complejidad limitada: candidato razonable. Probar WebGL real y liberar recursos; el QA cloud previo solo acreditó SVG. No prometer FPS sin escena real.
- Visión: empezar la evaluación por `qwen3-vl:2b` (descarga publicada 1.9 GB); probar 4B solo si hay margen y mejora útil. El archivo de pesos no incluye toda la memoria de ejecución. Fotos derivadas reducidas, contexto corto, un trabajo a la vez y conservación de originales. Si falta VRAM, evaluar descarga parcial a RAM/CPU con latencia medida; no presentar como rendimiento equivalente.
- Diseñar para presupuesto conservador de 4 GB de VRAM hasta comprobar la memoria dedicada real, sin afirmar que esa sea la configuración del usuario. Como recomendación de evaluación: 16 GB de RAM del sistema para el conjunto; no es un mínimo certificado y no requiere comprar memoria antes de probar.
- Fotogrametría: opción posterior para objetos aislados y captura adecuada, con benchmark propio de RAM/VRAM/tiempo. No es el botón básico de pocas fotos.
- TripoSR pide aproximadamente 6 GB de VRAM en configuración por defecto; no tomarlo como ruta cómoda garantizada. TRELLIS.2 oficial pide NVIDIA de al menos 24 GB y está probado en Linux: descartado como base para este portátil. No añadir estos motores por ahora.

### Experiencia propuesta, pendiente de decisión
Una instalación inicial de modo local y Ollama; objetivo de acceso directo que abra el editor en el navegador, sin terminal en el uso diario. Adaptador/instalador aún no desarrollados. Mantener habitaciones, plano/3D, puertas/ventanas, Revit, atajos e historial actuales. El sitio publicado continúa disponible; exportación/importación para trasladar proyectos, sin sincronización automática entre orígenes.

Seleccionar cubo → «Crear modelo desde fotos» → subir varias vistas y opcionalmente etiqueta → ver propuesta de tipo/piezas/color → corregir rasgos y confirmar medidas → aplicar. Por ejemplo, un escritorio pasaría a tablero, patas y cajonera aproximados. La propuesta no garantiza la marca exacta ni reconstruye fielmente lo oculto. Usar modelo GLB existente si se dispone del producto exacto, y escaneo como opción avanzada. Medidas manuales prevalecen; ficha comercial solo tras confirmar producto/variante; sin datos suficientes se piden medidas.

El análisis y generación básica se ejecutarían en el portátil, sin tarifa por llamada. La descarga inicial de software/modelo requiere Internet; la búsqueda comercial también. Lens sería una ayuda manual externa, no un servicio local ni una API integrada verificada. No instalar ni implementar la ruta local hasta que el usuario decida sobre esta propuesta.

## Fases y aceptación
El orden vinculante y dependencias están en ROADMAP.md (actualización2026-09-21). Primero mejoras independientes del editor; después assets, fotos, GLB y generadores manuales; conectar visión solo tras validar L0. L0 puede evaluarse aisladamente una vez aceptada la propuesta. Revit sigue en rama independiente. Se incluye explícitamente análisis posterior de fotos de habitación (F8c), además de muebles aislados.
No se marcan fases DONE por esta investigación. La gratuidad es requisito: las APIs pagadas mencionadas en investigación anterior no forman parte del flujo base.

## Fuentes primarias consultadas
- Visión y JSONOllama: https://docs.ollama.com/capabilities/vision y https://docs.ollama.com/capabilities/structured-outputs
- Modelo y tamaños: https://ollama.com/library/qwen3-vl
- Hardware/local: https://docs.ollama.com/gpu y https://docs.ollama.com/faq y https://docs.ollama.com/windows
- Lens: https://support.google.com/websearch/answer/1325808?co=GENIE.Platform%3DDesktop&hl=en
- CloudVisionProductSearch consulta catálogo propio; no esLens: https://docs.cloud.google.com/vision/product-search/docs y https://cloud.google.com/vision/product-search/pricing
- Gemini: https://ai.google.dev/gemini-api/docs/pricing y https://ai.google.dev/gemini-api/docs/billing
- RealityScan gratuidad: https://www.realityscan.com/download
- AMD2.2: https://www.realityscan.com/news/realityscan-2-2-is-here-with-full-amd-gpu-support-download-today
- CLI/export/escala: https://rshelp.capturingreality.com/en-US/tutorials/commandline.htm ; https://rshelp.capturingreality.com/en-US/tools/export.htm ; https://rshelp.capturingreality.com/en-US/tutorials/scaling.htm
- Captura: https://rshelp.capturingreality.com/en-US/tutorials/takingpictures.htm
- Fotogrametría abierta: https://github.com/alicevision/Meshroom y https://colmap.github.io/faq.html
- TripoSR: https://github.com/VAST-AI-Research/TripoSR
- TRELLIS.2: https://github.com/microsoft/TRELLIS.2
- ScaniverseClassic versus nube: https://apps.apple.com/us/app/scaniverse-3d-scanner/id1541433223 ; https://www.nianticspatial.com/faq/scaniverse . La antigua página scaniverse.com/support redirige a Capture; validar exportmesh actual antes de recomendarlo como camino garantizado.
