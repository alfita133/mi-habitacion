# Requisitos consolidados — Mi habitación

Fuente: instrucciones del usuario en la conversación de Work hasta el traspaso del 26-09-2026. Este documento expresa objetivos/comportamiento requerido, no certifica implementación. La evidencia y las diferencias actuales están en `PROJECT_STATUS.md`. Investigación histórica en `docs/RESEARCH.md` y `docs/FREE_PHOTO_PIPELINE.md`.

## R01. Propósito y plataforma
- Construir un gemelo digital editable de la habitación real, no una demo visual falsa.
- Web en navegador preferida; elegir solución sencilla, robusta, modular y mantenible, con posibilidad futura de ejecución local si facilita reconstrucción gratuita.
- Trabajar por fases y múltiples sesiones, sin intentar completar todo precipitadamente. Recuperar estado exclusivamente del repositorio en una nueva sesión.
- Uso personal, sin multiusuario/cuentas propias, social, marketplace, múltiples casas, recomendaciones de decoración, optimización automática de distribución ni análisis ergonómico/circulación. Varias habitaciones guardadas sí están autorizadas posteriormente.

## R02. Medidas y coordenadas
- Habitación: ancho, fondo/largo, alto. Objeto: ancho, fondo, alto. Puerta/ventana: ancho, alto, pared, posición sobre pared y cota inferior cuando corresponda.
- Entrada manual es fuente de verdad y prevalece siempre sobre estimaciones visuales. Mantener dimensiones reales al corregir/reconstruir geometría.
- Centímetros internos coherentes/documentados; preservar procedencia de cada medida. Ejemplos iniciales claramente identificados.
- Origen en esquina superior izquierda de la envolvente del suelo, X anchura, Y profundidad, Z altura; XY del objeto es centro y Z su base.
- Mostrar X/Y/Z, dónde está 0 y límites al añadir/editar; ayudas disponibles sin saturar la interfaz.
- Diferenciar altura/tamaño del objeto y elevación de su base. Ajuste cómodo por campos, botones/deslizadores; elevar también desde 3D.
- Restaurar alto definido al crear objeto; conservarlo al editar/duplicar. Esta acción no equivale a apoyar el objeto en suelo.

## R03. Dibujar y editar habitación
- No limitar a rectángulo perfecto: contornos libres por vértices/esquinas, incluidos entrantes y diagonales.
- Interacción inspirada en construcción de Los Sims: clic para primera esquina, clics sucesivos para paredes, tramo provisional y cotas, cierre sobre inicio; editar esquinas y añadir nuevas por clic sobre pared.
- Paredes editables; geometría de suelo/techo y anfitriones de puertas/ventanas coherentes al cambiar contorno. Rechazar autointersecciones y cambios estructurales imposibles explicando el motivo.
- Cuadrícula/ajuste como ayuda; poder dibujar más libremente. Medidas manuales, ratón y alternativa de teclado.
- Investigar patrones de herramientas similares y adaptar estilo/interacción de catálogo y web; no reducirlo a la lista textual que el usuario rechazó. Sweet Home 3D y Floorplanner fueron referencias documentadas; no reutilizar código/assets propietarios.

## R04. Plano 2D
- Vista superior con paredes, puertas/ventanas, elementos fijos, muebles, dimensiones y posiciones.
- Seleccionar y arrastrar elementos móviles, cuadrícula, giros y edición de medidas/propiedades.
- Cambios de posición/altura/giro deben verse inmediatamente en 3D desde el mismo estado.
- Dar alternativa por teclado y campos numéricos; permitir múltiples selecciones/conjuntos.
- Mostrar silueta/arco de apertura de puertas como referencia.

## R05. Visor 3D
- Representación 3D real editable con modelos/materiales/texturas cuando existan; no prometer fotorealismo de primitivas.
- Orbitar, zoom, desplazar cámara, observar diferentes ángulos; WASD con foco en visor.
- Encadre inicial que muestre la habitación completa y suelo útil, orientación cómoda, control de techo/interior, recentrar.
- Selección en cualquiera de vistas con controles contextuales comunes; elevar mediante arrastre de control 3D.
- Ampliar/priorizar plano o 3D dentro de la página y restaurar ambas vistas mediante iconos. Eliminar selector redundante «Ambas / Plano 2D / Vista 3D» en escritorio.
- Se puede usar fallback gráfico honesto si no hay WebGL, indicando limitaciones.

## R06. Muebles y edición
- ID estable, nombre, categoría, posición XYZ, giro, dimensiones, representación 3D, materiales/texturas y fotos originales asociadas cuando se habilite esa fase.
- Crear, seleccionar, mover, rotar, eliminar, duplicar, ocultar/mostrar, editar propiedades y dimensiones.
- Giros rápidos 15°, 45° y 90° además de entrada de giro numérica.
- Unir varios objetos en un conjunto y separarlos; conservar piezas/medidas y transformar conjuntamente.
- Ctrl/Cmd+C, X, V, Z, Y y Ctrl/Cmd+Shift+Z; copiar/cortar/pegar, deshacer/rehacer. No secuestrar la edición de texto en formularios.
- Ocultación persistente; en implementación actual los ocultos siguen siendo físicos, con aviso indicando esa condición.

## R07. Colisiones y formas huecas
- Evitar posiciones físicamente imposibles mediante detección, pero **permitir añadir, mover y guardar aunque se solapen o no quepan**: marcar rojo/avisar.
- Detectar paredes/límites, muebles y elementos fijos, teniendo en cuenta giro y Z. Contacto de superficies no es penetración.
- Objetos huecos no deben usar siempre envolvente sólida: escritorio con tablero sobresaliente, dos patas y pies; ventilador con base, soporte fino y cabezal; cama/almohada y curvas.
- Solución genérica de piezas/formas y plantillas comunes, editable sin depender de fotos. Misma geometría física en ambas vistas y colisiones.
- Dimensiones reales > silueta aproximada > apariencia. Corregir falsos positivos de redondeados y huecos.
- Escritorio elevable: desarrollo siguiente previsto de altura vinculada sin engordar tablero/pies. No llamar articulación al escalado proporcional existente.

## R08. Estructura, puertas y ventanas
- Usuario decide qué es fijo/estructural. Mantener estructura diferenciada de muebles y evitar borrado accidental.
- Puertas y ventanas deben poder moverse y editarse. Anfitrión pared, ancho, alto, posición, cota de ventana y forma visible.
- Puerta con bisagra/sentido/ángulo, apertura/cierre con ratón en vistas y alternativa de teclado/campos.
- **Hoja abierta y arco no son colisiones con muebles: son referencia visual.** La política actual también excluye la hoja cerrada de avisos físicos.
- **La apertura se detiene al tocar paredes, nunca las atraviesa.** Esta restricción es distinta de los avisos no bloqueantes para muebles.
- Elementos estructurales se integran en geometría de habitación; no volverlos objetos móviles ordinarios para facilitar edición.

## R09. Catálogo y biblioteca
- Añadir elementos predeterminados móviles y fijos mediante drag & drop al plano, con alternativa clic/teclado.
- Mobiliario habitual: cama, mesa/escritorio, silla, armario, estantería, ventilador; estructura: puerta, ventana, pilar/radiador u otros fijos.
- Plantillas con formas reconocibles y medidas de ejemplo editables, no gran marketplace de muebles comerciales.
- Catálogo/objetos más visuales: miniaturas, categorías o agrupación útil, búsqueda, estado de selección/ocultación/colisión claro.
- Estructura puede aparecer en sección propia de biblioteca, conservando protección y semántica separadas.

## R10. UX, accesibilidad y responsive
- Funcionalidad primero. UI minimalista, menos información/paneles simultáneos y menos pasos; ayudas/detalles secundarios plegables.
- «Añadir objeto» acción primaria con acento; Deshacer/Rehacer/Archivo/Ayuda discretos. Mostrar controles del elemento seleccionado juntos en panel contextual, sin obligar a saltar entre vistas/paneles.
- Botones/checkboxes mínimo 24×24 px y espacio suficiente; botones/iconos de ocultación consistentes, alineados por objeto.
- Toggles Interior/Techo con estado textual o icono, no solo color.
- Textos secundarios y etiquetas legibles: contraste objetivo WCAG AA 4.5:1, etiquetas del plano visibles sin zoom.
- Agrupar opciones de cuadrícula/medidas y visualización con separación lógica.
- Foco visible, etiquetas ARIA descriptivas para iconos, seleccionar/mover/ocultar/cambiar vistas por teclado. WASD no sustituye toda accesibilidad.
- Pantallas estrechas: un panel principal por vez, pestañas Plano 2D / Vista 3D / Objetos; no columnas que desborden.
- Mantener funciones existentes y coherencia entre 2D/3D/propiedades. Proponer antes de aplicar otras ideas de UX no solicitadas.

## R11. Persistencia
- Guardar y cargar diferentes habitaciones independientes; crear, renombrar, duplicar y gestionar las existentes.
- Persistir dimensiones/fuentes, posiciones, formas/piezas, grupos, ocultación, estructura, familias/parámetros, fotos/modelos asociados cuando se admitan.
- Preferir almacenamiento local sencillo (IndexedDB y archivos portables), sin servidor si no hace falta.
- Carga retrocompatible con todas las versiones ya guardadas, validación estricta, sin pérdida silenciosa.
- Asociar binarios con IDs y copia completa; fallos de cuota/corrupción no destruyen última copia válida.
- No se requiere versionado de diseños ni sincronización nube/multiusuario. Exportar/importar para mover datos entre orígenes/dispositivos.

## R12. Fotos de habitación — objetivo futuro, actualmente pausado
- Múltiples fotos desde diferentes ángulos, no depender exclusivamente de una.
- Detectar paredes, suelo/techo, puertas/ventanas, muebles/objetos; proponer dimensiones y posiciones estimadas y representación editable.
- Flujo objetivo: fotos → análisis → estructura/objetos → estimación geométrica → plano → medidas reales → corrección → reconstrucción → edición 2D/3D.
- Estimaciones nunca equivalen a medidas reales; revisar/confirmar hipótesis y preservar originales.

## R13. Fotos de objetos y gratuidad — objetivo futuro, actualmente pausado
- Vía principal futura «Añadir objeto mediante fotografías»: varias vistas frontal/lateral/trasera/45°/superior si útil, analizar, reconstruir, pedir medidas reales, ajustar y colocar.
- También sustituir una caja existente por objeto reconocido/modelado a partir de fotos conservando identidad, posición y datos.
- Identificar producto y buscar medidas si es viable; candidatos/ficha deben confirmarse, no equiparar parecido visual a SKU exacto. Manual siempre gana.
- Reconstrucción con máxima fidelidad razonable; comparar fotogrametría, splats, NeRF, image-to-3D, multimodal y geometría+texturas según precisión, complejidad, hardware, dependencias, ejecución local, APIs y coste.
- Flujo básico gratuito para uso personal y local; comodidad prioritaria. Usuario acepta considerar instalación o app local si necesario. APIs gratuitas/Lens fueron ideas para evaluar, no tecnologías autorizadas sin comprobar.
- Equipo confirmado: ASUS TUF Gaming F15, i7-12700H, RTX 3050 Laptop, 16 GB RAM. VRAM y entorno exacto de inferencia deben comprobarse; sin benchmark real todavía.
- Propuesta investigada: visión local ligera + generadores paramétricos; fotogrametría opcional y búsqueda Lens manual. No hay integración Lens automática ni API oficial gratuita validada, ni servicio/motor local instalado.
- **Pausa vigente:** el usuario indicó realizar partes previas pero no iniciar «parte 5: Importación de fotos y modelos GLB». Ninguna petición posterior la levantó expresamente. No confundir infraestructura de assets ni piezas manuales con permiso para iniciar fotos/GLB/IA.

## R14. Integración Revit
- Panel «Familias Revit»; importar `.rfa` (nunca `.raf`) por selector o arrastre. Web conserva originales/catálogo/previews/metadatos, no decodifica binario de forma ficticia.
- Complemento independiente C#/.NET para Revit de escritorio Windows usando API Autodesk oficial: extraer familias/tipos/parámetros y geometría necesaria; exportación/importación del proyecto.
- Biblioteca visual: miniatura, nombre, categoría, dimensiones, unidades y parámetros editables; búsqueda/filtro.
- Categorías: puertas, ventanas, camas, mesas, sillas, armarios, escritorios, estanterías, iluminación, decoración.
- Elección manual y asistente que sugiera lo que falta según descripción y objetos presentes (p. ej. zona de estudio). Solo sugerir, jamás añadir automáticamente.
- Instancias móviles conservan capacidades de objetos: seleccionar/mover/girar/elevar/duplicar/ocultar/agrupar/atajos/historial/guardado. Puertas/ventanas conservan estructura y deben ser editables/movibles sobre muros; agrupar/ocultar estas como muebles no está resuelto ni debe afirmarse.
- `.habitacion.json` conserva habitación, contorno, coordenadas, giro, elevación, identificación/ruta de familia, tipo, parámetros, ocultación, grupos y estado relevante.
- Importador crea muros, suelo, techo, carga RFA y coloca instancias con parámetros/cotas/giro. Informe de ausentes/incompatibles sin detener las demás instancias; no sacrificar dimensiones.
- Revit Windows prioritario; no prometer Revit Web/LT. Compilar/probar con versión instalada antes de declarar listo.
- Web y formato primero; complemento independiente/documentado después. Preservar habitaciones antiguas. Retorno de cambios Revit y geometría detallada aún pendientes.

## R15. Ingeniería, pruebas y continuidad
- Separar UI, datos, geometría, 2D, 3D, imágenes, reconstrucción, persistencia, colisiones e integración.
- Roadmap obligatorio PENDING / IN PROGRESS / DONE / BLOCKED, por dependencias; geometría básica antes de reconstrucción.
- Después de cada fase ejecutar aplicación, pruebas relevantes, corregir errores y regresiones antes de marcar terminada.
- Mantener `docs/PROJECT_STATE.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md`, `DATA_MODEL.md` desde el principio y durante todo trabajo; ahora añadir guías raíz para Codex.
- Checkpoints: guardar, probar, actualizar estado/roadmap/decisiones y commit pequeño descriptivo; al reducirse contexto, cerrar punto consistente y escribir siguiente acción exacta.
- Autonomía en decisiones razonables; no nuevas funcionalidades durante traspaso. Todo código necesario en Git, sin secretos/node_modules/temporales; commit final exacto: `Prepare project handoff from ChatGPT Work to Codex`.

## Sustituciones explícitas y decisiones no adoptadas
| Antes | Decisión vigente posterior |
|---|---|
| Solo una habitación | Varias habitaciones guardadas/cargables independientes |
| No gran catálogo genérico | Biblioteca pequeña de presets fijos/móviles y familias Revit autorizada; no marketplace |
| Colisiones impiden posiciones | Avisos rojos que permiten crear/mover/guardar incluso fuera de límites |
| Puertas/ventanas no móviles ni en Añadir objeto | Editables/movibles en pared y sección estructural propia del catálogo |
| Hoja de puerta colisionable | Referencia sin colisión con muebles; límite de apertura por paredes |
| Habitación rectangular inicial | Contorno libre por clic/esquinas; rectángulo es una opción/migración |
| Selector «Ambas / Plano 2D / Vista 3D» | Iconos ampliar/restaurar; pestañas móviles sí autorizadas |
| Lista textual extensa con ayudas siempre abiertas | Catálogo/galería visual, propiedades contextuales y detalles plegables |
| Fotos como prioridad inicial de implementación | Objetivo conservado, implementación fotos/GLB/IA expresamente pausada |
| Repositorio privado posible | Usuario autorizó expresamente GitHub público |

No existe decisión del usuario de pagar APIs, implantar Lens por scraping, cambiar todo a Electron, usar NeRF/splats como base o entrenar un motor pesado. Fueron posibilidades/alternativas de investigación, no funcionalidades prometidas ni descartes definitivos de toda técnica futura.
