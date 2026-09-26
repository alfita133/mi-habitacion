# Verificación del primer hito — 2026-09-16

## Automatizada
`pnpm test`: 8 pruebas aprobadas. Incluyen ejemplos no medidos, prioridad de medida manual ante estimación posterior, eliminación explícita de medida manual, rechazo de dimensiones inválidas, paredes fuera del interior, suelo/techo, roundtrip JSON, rechazo de formato futuro y correspondencia exacta de mallas Three con las dimensiones del dominio.

`pnpm typecheck`: aprobado. ESLint de `src` y `app/page.tsx`: aprobado. Build de producción completado; advertencia de bundle >500 kB por Three y componentes, sin error de compilación. No se ha hecho optimización prematura de dependencias del starter.

## Ejecución real en navegador de Work
| Prueba | Resultado |
|---|---|
| Arranque y habitación 400 × 350 × 260 etiquetada Ejemplo | PASS |
| Plano métrico con cuadrícula y área | PASS |
| Three SVGRenderer con perspectiva y paredes/suelo reales | PASS |
| Introducir 425,5 / 315 / 245 cm | PASS: ambas vistas, área y volumen actualizados |
| Prioridad manual y etiquetas Real | PASS |
| Recargar después de guardar | PASS: reaparece ancho 425.5 y restantes medidas |
| Ancho -20 | PASS: error visible, geometría válida anterior conservada |
| Arrastrar cámara para orbitar | PASS: cambia la proyección SVG |
| Botón Centrar | PASS: restaura la proyección |
| Exportar copia | PASS: archivo descargado y deserializado desde disco, dimensiones 425.5 / 315 / 245 |
| Importar copia por selector y cancelar/confirmar | PENDING: evento recibido, operación de carga bloqueada/interrumpida en automatización |
| Zoom y desplazamiento de cámara | PENDING: intento bloqueado por timeout del controlador, no atribuible a fallo funcional comprobado |
| WebGL2 acelerado, sombras | NOT VERIFIED: navegador cloud indica GL_RENDERER=Disabled |
| iPhone/Safari y gestos táctiles | NOT VERIFIED |

## Incidencias corregidas
- `crypto.randomUUID` no existe en preview HTTP: usar UUID v4 con getRandomValues; arranque comprobado después.
- WebGL no disponible: fallback oficial SVGRenderer con la misma escena y OrbitControls, etiquetado sin texturas. Sin detecciones ni modelos falsificados.
- Artefactos de ordenación de líneas sobre suelo en SVG: no dibujar cuadrícula del suelo en ese modo; el plano mantiene su cuadrícula.

## Limitaciones de la prueba
El controlador notificó timeout al esperar descarga, pero el archivo sí se guardó en el directorio compartido y se comprobó su contenido. La carga por selector quedó bloqueada en una llamada y fue interrumpida. Una llamada posterior al navegador agotó su plazo antes de despachar la orden. No declarar aprobada la importación UI ni zoom/pan hasta retomarlos.

## Pruebas pendientes al cierre de la primera sesión (resueltas abajo)
1. Arrancar preview limpio y abrir la aplicación.
2. Importar `tests/fixtures/room-measured.json` mediante Abrir copia. Cancelar y comprobar que el proyecto previo no cambia.
3. Repetir y confirmar. Verificar 425.5 × 315 × 245, guardar y recargar.
4. Importar `tests/fixtures/unsupported.json`: error sin pérdida del proyecto actual.
5. Comprobar rueda/pellizco, desplazamiento y toggles de techo/paredes. En un dispositivo con WebGL2, verificar render acelerado y liberar recursos al recargar.
6. Mantener pendientes los casos que no permita el entorno. Con QA base resuelta, seguir F4.

## Segunda sesión: estructura y recuperación
Recuperado origin/main antes de editar. Pruebas base repetidas sin fallos.
- Zoom con rueda, desplazamiento con Shift+arrastre y toggle de techo: PASS en navegador SVG, comparando proyección antes/después.
- Crear puerta Entrada (A, 90 × 210, offset 40) y ventana lateral (D, 120 × 100, offset 100, cota 95): PASS en UI y representación real 2D/3D inspeccionada.
- Hueco solapado: PASS, mensaje visible y operación rechazada.
- Editar offset de Entrada a 55 y recargar: PASS; dimensiones y posición de ambos elementos persistidas.
- Reducir ancho de habitación a 100: PASS, rechazo sin alterar dimensiones manuales ni huecos.
- Cancelar borrado de ventana: PASS. Confirmar borrado: PASS, retirada del elemento y regeneración de pared.
- Esquema V2, migración de V1, geometría con conservación exacta de volumen en cuatro paredes, ventanas apiladas, límites, IDs duplicados, prioridad manual y raycast sobre malla real: tests/openings.test.mjs.
El modo WebGL acelerado y los gestos de Safari siguen pendientes de un dispositivo compatible. No se simula esa verificación.

### Cierre del segundo hito
- Importación UI de V1 mediante selector: PASS; cancelar conserva Entrada, confirmar carga 425.5 × 315 × 245, y recarga conserva la copia migrada.
- Importar formato 99: PASS; error visible en status y habitación conservada, sin diálogo de sustitución.
- Corregida advertencia React por claves idénticas entre formularios hermanos; prefijos diferenciados. Tras recargar: cambio de ancho a 440 sincroniza vistas y no hay nuevos errores de aplicación en consola (se excluyen mensajes ajenos de extensión).
- 16 pruebas automatizadas PASS. Typecheck y lint de aplicación PASS. Verificación visual de huecos y marcos realizada en el modo SVG, sin atribuirle texturas o sombras aceleradas.
- No se ejecutaron pruebas en Safari/iPhone ni WebGL2 porque el navegador cloud no ofrece ese contexto. Quedan como matriz de compatibilidad pendiente; no bloquean el modo compatible comprobado.

Próxima validación: objetos móviles y colisiones (F5/F6), incluyendo giro, altura, límites de pared y volúmenes de marcos/vidrio. No asumir que una puerta tiene hoja física hasta modelarla.

## Tercer hito F5 — objetos
22 tests PASS: regresión anterior, migración V2 con puerta, SAT giro/contacto/altura, límites y reducción de habitación, barrido continuo, prioridad manual, roundtrip V3 y mallas Three exactas.
UI cloud: crear60×40×80; giro15°; arrastre100,100→170,150; ancho70; rechazo X5; rechazo nuevo objeto superpuesto; alta segundo en280,150; recarga conserva ambos; arrastre a través del segundo bloqueado manteniendo210,150; borrar segundo: PASS. Inspección 2D/3D realizada. Corregida ordenación de suelo SVG y ocultadas etiquetas centrales al haber objetos. Consola observada sin errores de aplicación; mensajes de extensión ajena excluidos. WebGL y táctil siguen no verificados. Barrido angular y obstáculos fijos interiores pendientes F6.

Build de producción F5 aprobado, con advertencia conocida de tamaño del bundle Three. Typecheck/lint y22tests aprobados tras ajustes finales.

## V4 — edición libre solicitada
26 tests PASS (incluye V3→V4, composición/descomposición sin pérdida, rotación rígida, ocultación y colisiones persistidas, rojo real de malla, rechazo de referencias/IDs inválidos). Pruebas anteriores de bloqueo de muebles actualizadas a permiso+aviso conforme a nueva instrucción.
QA UI PASS: alta superpuesta, 2avisos; +5Z/suelo; marcar2/unir/girar; ocultar conjunto y recargar persistiendo ocultación; mostrar/separar; X440/alto300 guardado rojo en ambas vistas, Centrar3D incluye exterior; guía de origen/ejes/límites. No errores de app observados (excluidas extensiones). WebGL/Safari/táctil aún no verificados.

Slider accesible de baseZ probado con teclado ArrowRight: Z0→1 PASS. Typecheck/lint/26tests finales PASS.

## V5: elevación y atajos
29tests PASS: baseline/migraciónV4, clipboard grupo/IDs/offset/medidas, undo/redo/bifurcación/gesto único, regresiones. Typecheck/lint PASS. UI cloud PASS: crearalto100; dragZ0→73; CtrlZ0/CtrlY73; CtrlC/V/X counts2→3→2; corte+undo; alto180→reset100; textoCtrlX conserva objetos; recarga; click3D selecciona. Eventos nativos copy/cut/paste cubren automatización y menús. Historial reinicia al recargar por diseño. WebGL/Safari/táctil no verificados. SVG conserva limitaciones de ordenación de caras superpuestas.

2026-09-17 cierre F5.2: typecheck, ESLint y 29 tests PASS; build producción PASS; publicación privada SUCCEEDED.

## F5.3 — habitaciones y vistas ampliables
32 tests PASS; migración conserva proyecto previo y medidas, duplicación aislada, IDs/activeId válidos, no borrar última habitación, multiarrastre deduplica grupos. Typecheck/ESLint PASS.
UI cloud: crear habitación, añadir mueble, cambiar a anterior vacía y volver, recargar conserva objeto; renombrar/duplicar, edición de copia no modifica original; confirmación de borrar y cancelar; ampliar plano/3D y retornar ambas; selección contextual, Ctrl+clic dos muebles, mover ambos (50,25), undo único, ocultar ambos y undo. Historial aislado al cambiar de habitación. Miniaturas reales derivadas de geometría.
Límites: borrado definitivo verificado en dominio (UI prueba cancelación); migración legacy verificada por test puro; WebGL/Safari/táctil pendientes.

Cierre F5.3: build producción PASS y despliegue privado SUCCEEDED 2026-09-17T13:51:52Z.

## R1 / F5.4 — 2026-09-17
40 Node tests PASS; TypeScript --noEmit y ESLint src/app-page PASS. Nueva regresión valida RFA8MB sin desbordamiento de pila; base64 inválido rechazado. V5→V6 conserva contenido, JSON raw/envelope conserva bindings/parámetros y operaciones de mover/rotar/copiar/agrupar/ocultar. Conversión cm/pies y signoY probada.

QA navegador preview: original con cabecera OLE sintética queda pendiente/no añadible (NO es familia real); manifiesto sintético procesado importado, búsqueda y sugerencias de estudio sin mutación; añadir familia confirmada120×60×75 en450/100/20 avisa rojo2D/3D sin bloquear. Editar Code a QA-editado y girar15°, recargar conserva catálogo2/objeto1. Exportar para Revit produjo archivo real habitacion.revit-project/V6 con originales y parámetros; abrir ese archivo añade segunda habitación sin reemplazar primera y preserva Code/XYZ/giro. Timeout del evento de descarga del navegador, pero archivo existente validado/reimportado. Vista3D ampliada/restaurada y captura de ambas vistas con aviso rojo verificadas.

F5.4: puerta QA norte offset40→140 por arrastre; deshacer→40; editar pared este offset120 actualiza hueco real3D. Tests cubren mover ventana/cota y rechazar solapamiento/fuera de pared. Botones textuales de vista eliminados, iconos conservados.

Complemento C# no compilado: entorno Linux sin dotnet/RevitAPI. Matriz real de aceptación en integrations/revit/README.md, R2/R3 BLOCKED. No afirmar fotogrametría, mallasRevit, bidireccionalidad real ni compatibilidad universal de familias.

Build producción R1 PASS: salida Worker y cliente generadas. Aviso no bloqueante de chunkThree >500kB; no error de build.

2026-09-21 F5.5a: QA navegador giro45°/90° y undo/redo conservan posición/medidas.7 pruebas grupos/historial PASS, typecheck PASS.

2026-09-21 F5.5b:43 Node tests PASS y typecheck PASS. Matriz cuatro paredes×dos bisagras×dos sentidos,0/45/90/180°, medidas manuales, migraciónV6 sin swing, Three posición/giro y JSON. Navegador: puerta90×205offset40, bisagra final/45°, undo/redo y recarga, capturaSVG3D inspeccionada.

2026-09-21 F6:47 pruebas Node PASS, TypeScript y lint PASS. Cobertura: fijos rotados, separaciónZ, IDs duplicados, ocultos físicos, hoja actual vs sector barrido, color Three, migraciónV7 y undo. QA navegador: pilar30×30×260 sobre mesa, aviso2elementos y guardado aceptado; undo/redo, recarga.

## F7a — checkpoint V9
55 pruebas Node PASS; TypeScript/lint PASS. Tests de copia: bytes exactos/SHA256, deduplicación, RFA original, corrupción/truncamiento/bytes extra, JSON antiguo y rechazo de referencias sin archivos. IDB simulado: migraciónV1→V2 conservando current, duplicar/exportar/restaurar, rollback ante faltantes/cuota/hash y recuperación de cola.
QA navegador real preview: copia corrupta fixture.bin rechazada sin cambiar habitación; copia válida crea segunda habitación con mesa45°, puerta90°, pilar, familiaRFA pendiente y binario; recargar mantiene todo. Rojo2D/3D inspeccionado. Fixtures sintéticos, no fotografías/GLB. Enlace Descargar copia aparece tras preparación; click y espera de download no entregaron archivo compartido/evento. Descarga final UI NOT VERIFIED; no declarar F7a DONE ni confundir pruebas de codec con descarga real. WebGL/WindowsRevit siguen pendientes.

Build producción V9 PASS; publicación SUCCEEDED. Advertencia conocida de chunk Three >500kB, sin error.

## V10 — piezas y plantillas (2026-09-22)
60 tests Node PASS + TypeScript PASS, repetidos tras ajuste final de límites físicos. Nueva cobertura: cajonera en hueco de escritorio, tablero/patas, giro90° y elevación, obstáculos fijos, esquina vacía de base circular, soporte fino/cabezal, cuatro plantillas, validación límites/IDs, escalado medido, V9→V10, clipboard/grupos/ocultación, pack completo y mallas con parent objectId.
QA preview PASS: crear escritorio160×80×80; abrir Forma y colisiones; tablero fuera de envolvente rechazado; cambiar base76→75/grosor4→5; undo devuelve4, redo y recarga conserva5. Crear caja30×30×50 debajo en200,150: cero avisos. Cama y ventilador creados en UI, formas curvas/render SVG inspeccionados. Contacto patas de cama/pie escritorio avisa rojo; separarlas elimina aviso. Sin errores de app observados (extensión cloud excluida). WebGL acelerado y WindowsRevit no probados. La verificación de descarga .pack sigue pendiente de sesión anterior.

Cierre V10:60tests PASS, TypeScript y build producción PASS. Publicación SUCCEEDED 2026-09-22. Advertencia de chunkThree >500kB conocida.

## Curvas y formas — corrección22sept
66tests PASS y TypeScript PASS.6 nuevas pruebas: base circular tangente/penetrante a pared, esquinas verticales libres de elipsoide, matriz121casos esfera/caja contrastados con distancia analítica y simetría, esfera/esfera y cilindros tangentes/girados, armario hueco/puertas/persistencia y geometría estructural con IDs.
QA preview: ventilador40cm centradoX380 en habitación400 toca pared y no avisa; X380.1 muestra1aviso sin bloquear; undo elimina aviso. Armario/ventana/puerta representados e inspeccionados en SVG; importación conserva datos. Captura docs/qa/curves-fixed.jpg. No se dispone del JSON real del usuario: no afirmar reproducción exacta de su distribución a partir de captura. WebGL/Windows y descarga .pack siguen pendientes como antes.

Cierre corrección curvas:66tests,TypeScript y build PASS; publicación SUCCEEDED22sept15:36UTC.

##2026-09-22 — Puertas y navegación
68 pruebas Node PASS. Nuevas pruebas: ángulo recuperado por punto en cuatro paredes, ambas bisagras/sentidos,0–180°; encuadre incluye ocho esquinas en formatos estrecho/ancho y habitación extrema. Regresión puerta/mueble superpuestos no avisa ni enrojece hoja; pruebas anteriores de obstáculos sí siguen PASS. TypeScript y lint de cambios principales PASS. Preview con datos sintéticos: arrastre círculo60→0, undo60, redo0; arrastre hoja3D0→74, undo0, redo74; recarga74; W cambia geometría proyectada y S recupera; Ayuda abre sin modificar proyecto. SVG fallback, no QA WebGL del portátil.

## 2026-09-23 — V11
75 pruebas Node y typecheck PASS. Nuevo test de copia pack/historial poligonal. QA preview real: dibujo L10m² por clic y por campos; floor3D sin rellenar entrante; preset escritorio por arrastre; mover con flechas, editar X120/alto80, ocultar/mostrar; puerta P1offset0 limitada90° incluso End; pilar fuera dentro del contorno; recarga conserva cambios. Móvil iframe390px: un panel activo, añadir por Enter y editar sin salir del panel, botones de vista y cabecera sin solape. Checkbox24px y ocultar40px. Paleta: #46566b sobre blanco7.49:1 y #f4f7fb6.97:1; blanco sobre #155cba6.42:1. No auditoría completa ni prueba táctil física. Cloud usa renderer SVG compatible; WebGL sigue pendiente en portátil. Evidencia docs/qa/v11-desktop.jpg y v11-mobile.jpg, datos sintéticos.
