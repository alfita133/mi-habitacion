# Investigación técnica — 2026-09-16

Actualización2026-09-21: FREE_PHOTO_PIPELINE.md prioriza uso gratuito/local a petición del usuario; servicios de pago de esta comparación histórica quedan fuera del flujo base.

## Entorno inspeccionado
Linux gestionado, Node y Git disponibles, starter React/TypeScript con instalación pnpm desde caché verificada. No se encontró `nvidia-smi`; no hay GPU CUDA comprobada. Red de shell restringida. Browser QA disponible mediante preview supervisado. El alojamiento Worker tiene 128 MB por isolate: no es un entorno para entrenamiento 3D. No hay claves de una API de reconstrucción disponibles ni fotos del usuario todavía.

## Comparación
| Técnica | Precisión y edición | Complejidad / hardware | Local / API / coste | Decisión |
|---|---|---|---|---|
| Geometría paramétrica + texturas | Dimensiones exactas introducidas; silueta aproximada; apariencia depende de fotos/UV | Baja; navegador y WebGL2 | Local, sin coste por operación | Base elegida; no es reconstrucción automática |
| Fotogrametría COLMAP | Geometría por correspondencias; requiere escala real y puede fallar con paredes lisas, reflejos u oclusiones | Alta; captura solapada, SfM y reconstrucción densa | Herramienta local; hardware/tiempo propios; verificar GPU y binarios al integrar | Adaptador/importación futura; no ejecutado aquí |
| Gaussian Splatting | Apariencia de escena, no malla semántica editable de muebles | Alta; entrenamiento y render especializados | Código de investigación, GPU y licencias a revisar | Pospuesto; no sustituye geometría ni colisiones |
| NeRF / Nerfstudio | Representación de vistas; extracción y separación de objetos requieren trabajo adicional | Alta; Python, PyTorch, CUDA y dependencias nativas | PC/GPU o cómputo externo con coste variable | Pospuesto |
| Meshy multivista | Mallas/texturas generadas; fidelidad y escala no garantizadas | Cliente sencillo, API asíncrona y puente seguro con clave | Externo; 1–4 imágenes. Meshy 6/7: 20 créditos sin textura, 30 con textura, 35 con 8K; extras según modo | Candidato optativo; no conectado ni coste incurrido |
| Modelos multimodales | Pueden proponer etiquetas y posiciones; no certifican escala, profundidad ni malla | Depende del proveedor/modelo; hay que comprobar contrato y evaluación | API o modelo local; costes no verificados | Fase posterior; nunca inventar detecciones |

Las conclusiones de adecuación son juicio de ingeniería para este proyecto, no resultados de una prueba comparativa propia. Precios consultados sujetos a cambio; no se ha verificado conversión de créditos a euros.

## Fuentes oficiales
- Three.js: https://threejs.org/docs/ — renderer WebGL2, OrbitControls y geometrías. Versión fijada para reproducibilidad.
- COLMAP: https://colmap.github.io/tutorial.html — captura, SfM, reconstrucción y limitaciones de escenas.
- Nerfstudio: https://docs.nerf.studio/quickstart/installation.html — instalación Python/PyTorch/CUDA.
- Trabajo original 3DGS: https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/ — representación y síntesis de nuevas vistas.
- Meshy: https://docs.meshy.ai/en/api/multi-image-to-3d — contrato multivista, entrada y modelos.
- Coste API: https://docs.meshy.ai/en/api/pricing — créditos separados de la aplicación web.

## Ruta elegida
Geometría común → edición y colisiones → originales multivista → propuestas revisables → modelos procedurales/texturas y GLB con escala medida. Solo después evaluar un conjunto real de fotos y conectar una API o reconstrucción local comprobada. Una foto aplicada a una caja debe etiquetarse como aproximación, nunca como reconstrucción fiel.
