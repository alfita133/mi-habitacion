# Roadmap

Traspaso26-09-2026: guías raíz consolidadas. Orden vigente: U5 (incluye B01) → B02 → cerrar QA descarga F7a → P4. Fotos/GLB/IA pausados. RevitWindows independiente. Estado auditado/evidencia en PROJECT_STATUS.md.

Checkpoint GitHub (2026-09-26): **DONE**. Repositorio público `alfita133/mi-habitacion`, rama `main`, snapshot completo de 204 archivos subido mediante API GitHub y árbol idéntico al local comprobado. Historial anterior permanece en Sites/local. U5 sigue pendiente de cierre QA y despliegue.

Cada fase requiere código, pruebas relevantes, ejecución, documentación actualizada y commit. DONE significa que se ha verificado, no solo escrito.

| Fase | Alcance y aceptación | Estado |
|---|---|---|
| F0 | Capacidades, investigación comparada, arquitectura y continuidad | DONE |
| F1 | Modelo con unidades y prioridades, validación y pruebas de dominio | DONE |
| F2 | Habitación 2D/3D sincronizada; órbita, zoom y desplazamiento | DONE |
| F3 | Medidas reales, validación, IndexedDB y exportar/importar JSON | DONE |
| F4 | Puertas/ventanas fijas; geometría con huecos y edición protegida | DONE |
| F5 | Objetos: selección, arrastre 2D, giro, dimensiones, propiedades y borrado | DONE |
| F5.1 | Avisos sin bloqueo, conjuntos, ocultar y altura/ejes | DONE |
| F5.2 | Elevación3D, alto inicial, copiar/cortar/pegar y deshacer/rehacer | DONE |
| F5.3 | Habitaciones guardadas, UI contextual, selección múltiple y ampliar vistas | DONE |
| F5.4 | Recolocar puertas/ventanas y simplificar controles de vista | DONE |
| F5.5 | Silueta de puerta abierta y arco de apertura en plano; giros rápidos de objetos 15°, 45° y 90° | DONE |
| R0 | Investigación Revit y contrato de intercambio | DONE |
| R1 | Biblioteca web RFA pendiente + manifiestos procesados, parámetros, sugerencias e intercambio | DONE |
| R2 | Proyecto independiente C# Revit: extracción/importación/informe (fuente preparada; validación Windows pendiente) | BLOCKED |
| R3 | Compilar y validar en Windows/Revit con familias reales; retorno y mallas detalladas | BLOCKED |
| F6 | OBB/SAT + Z; paredes y volúmenes fijos; avisos visuales sin bloquear | DONE |
| L0 | Validar modo local y visión gratuita en hardware del usuario; fotos→objeto según FREE_PHOTO_PIPELINE.md | PENDING |
| F7 | Fotos múltiples originales en IndexedDB, asociación y copia portable con assets | PENDING |
| F8 | Visión local Ollama evaluada con propuestas/rasgos/OCR revisables; ficha comercial asistida | PENDING |
| F9 | Modelos paramétricos medidos + GLB/texturas; fotogrametría local opcional sin APIs pagadas | PENDING |
| F10 | Integración del flujo fotos → medidas → modelo → colocación; regresión y documentación | PENDING |

## Límites
La reconstrucción automática fotorrealista no se considera implementada mediante una caja o una textura. F8 necesita un proveedor de visión real o un motor local comprobado. Un bloqueo de proveedor se registra como BLOCKED sin bloquear la edición geométrica local.

## Orden de ejecución por dependencias — 2026-09-21

Este orden sustituye «Próximo incremento» anterior. Los IDs históricos se conservan: el orden numérico no obliga a esperar a una fase ajena. Autorización vigente: realizar partes 1–4 de la tabla presentada al usuario, equivalentes a F5.5/F6/F7a aquí. La parte 5 excluida es IMPORTACIÓN de fotos/GLB (F7b/F9a), no F7a infraestructura. No iniciar esa importación ni motores de IA.

| Orden | Incremento | Depende de | Resultado y criterio de cierre | Estado |
|---|---|---|---|---|
| 1 | F5.5a: giros rápidos 15°/45°/90° | Editor actual | Objetos y conjuntos; mismas operaciones de giro, historial y avisos. No requiere cambio de esquema ni IA | DONE |
| 2 | F5.5b: silueta de puerta abierta | Editor actual | Bisagra, sentido y ángulo definidos; hoja/arco en cuatro paredes, migración y guardado. No inferir orientación real de puertas antiguas | DONE |
| 3 | F6a: elementos fijos interiores | Dominio actual | Clasificación manual de obstáculos, edición protegida y avisos rojos; ninguna colocación de muebles bloqueada | DONE |
| 4 | F6b: hoja de puerta y colisiones | F5.5b | Aviso de intersección con hoja en su posición; distinguirlo del barrido completo. Este último no es requisito de ergonomía ni debe bloquear colocación | DONE |
| 5 | F7a: infraestructura de assets | Persistencia actual | Fotos/mallas fuera del JSON en memoria de edición; IDs, cuotas, copia portable con binarios, restauración atómica y migración sin perder RFA/bindings | IN PROGRESS |
| 6 | F7b: fotografías asociadas | F7a | Importación múltiple para habitación/objeto, originales, ángulos, miniaturas y eliminar referencias sin pérdida accidental; sin afirmar análisis automático | PENDING |
| 7 | F9a: importar modelos GLB | F7a; no requiere F7b ni IA | Cambiar cubo por modelo, orientación/unidades, medidas manuales prioritarias, preservar ID/grupos/Revit, texturas y copia completa. Limitar complejidad para portátil | PENDING |
| 8 | F9b: geometría paramétrica editable | Contrato procedural V10, independiente de F9a | Piezas para muebles comunes con parámetros manuales y previsualización; deshacer y persistencia. P1–P3 DONE, articulación P4 pendiente | IN PROGRESS |
| Rama local | L0: prueba de viabilidad, tras decisión del usuario | SO/VRAM pendientes; CPU/GPU y RAM16GB conocidas | Arranque del editor local y prueba Ollama con 2–3 objetos reales; registrar calidad, memoria y latencia con visor abierto. Puede probarse aparte sin esperar pasos 1–8 | PENDING |
| 9 | F8a: asistente fotográfico de objetos | L0 aprobado/verificado + F7b + F9b | Varias fotos → propuesta revisable → confirmar medidas → modelo por piezas. OCR/rasgos, fuente de dimensiones, sin añadir ni sustituir automáticamente | PENDING |
| 10 | F8b: búsqueda de producto asistida | F8a y procedencia de medidas | Etiqueta/referencia o Lens manual, ficha/URL/captura y variante confirmada; nunca atribuir una medida a un producto solo por parecido | PENDING |
| 11 | F8c: análisis de la habitación | F7b + L0 + F8a | Proponer paredes/suelo/techo/huecos/objetos desde varias fotos, vincular vistas del mismo objeto y confirmar correspondencias. Plano rectangular corregido por medidas reales; no prometer reconstrucción métrica automática | PENDING |
| 12 | F9c: fotogrametría/texturas detalladas opcionales | F7a + F9a y prueba específica del escáner en portátil | Escaneo de un objeto, escala conocida, limpieza y GLB. Evaluar RealityScan; no condicionar el uso básico a capturar muchas fotos | PENDING |
| Continuo / cierre | F10: integración y regresión | Cada incremento / flujo elegido completo | Guardar/cargar, migraciones, atajos, grupos, ocultación, avisos, cancelación/recuperación y prueba WebGL real. Se prueba en cada entrega, no solo al final | PENDING |
| Rama independiente | R2: complemento Revit real | Windows + Revit instalado, versión exacta y DLL oficiales | Compilar y ejecutar extracción/importación con familias reales; informe por elemento y dimensiones comprobadas | BLOCKED |
| Después de R2 | R3: mallas e intercambio de cambios Revit | R2; F7a/F9a para mallas web | Retorno de cambios reales con correspondencia de instancias. El snapshot actual no lo resuelve | BLOCKED |

### Reglas para evitar trabajo duplicado
- Cerrar cambios de dominio de puertas/obstáculos antes de integrar el flujo fotográfico. No reservar V7 para fotos: cada cambio incompatible toma la siguiente versión libre y añade migración/pruebas. No implementar ahora campos de fases futuras solo para ahorrar versiones.
- F7a es la dependencia común de fotos y mallas: no crear dos almacenes ni dos formatos de copia. Mantener importación de `.habitacion.json` y familias V6; separar el paquete con assets del intercambio Revit si se precisa.
- F9a/F9b comparten contrato de representación; la IA propone parámetros de ese contrato, no otro editor ni geometría alternativa. Las colisiones conservan una representación medida independiente de la malla.
- Revit no bloquea fotos/GLB/editor. Una malla importada o generada no se convierte automáticamente en familia RFA paramétrica. Mantener un adaptador de intercambio y rechazar/informar versiones no soportadas.
- L0 se prepara como prueba aislada después de la decisión del usuario; su fallo no bloquea F5.5/F6/F7/F9a/F9b. La gratuidad no depende de cuotas de una API externa.
- F8c conserva el objetivo original de fotos de habitación: no dar por resuelta la detección de paredes/puertas/objetos por haber analizado un mueble aislado.

## Siguiente acción
Seguir el procedimiento U5 en `../PROJECT_STATUS.md`: dibujo/clic/galería/móvil/teclado y persistencia; B01 reproducido pendiente. Después B02, descarga/reimportaciónF7a y P4. No iniciar fotos/GLB/IA.

## Prioridad vigente — objetos huecos (2026-09-22)
Este orden adelanta F9b y elimina su dependencia de GLB: representación procedural independiente.
1. P1 DONE: contrato V10 de piezas, cajas/cilindros/elipsoides y colisiones compuestas, migración V1–V9.
2. P2 DONE: editor genérico de piezas en cm, render sincronizado y conversión de objetos existentes conservando identidad.
3. P3 DONE: plantillas cama/escritorio/estantería/ventilador usando el mismo contrato; ajustes manuales, guardado e historial.
4. P4 PENDING: parámetros vinculados (escritorio elevable sin engrosar patas) y formas curvas de colisión más precisas. No confundir escalado proporcional con articulación.
5. F7a: descarga real pendiente, WebGL portátil y Revit Windows en paralelo cuando haya entorno.
6. Fotos/GLB/IA: no iniciar, exclusión vigente.

## Corrección prioritaria solicitada — curvas y formas
DONE: sustituir prisma elíptico/polígono inflado por volumen convexo real y límites analíticos; comprobar tangencia y penetración. Añadir armario editable y detalle de hoja/ventana estructural. Este arreglo precede P4; no fotos/GLB.

## Ajuste de usabilidad solicitado 2026-09-22
DONE — Apertura como referencia sin colisión; ratón 2D/3D, WASD y encuadre completo; ayuda bajo demanda. 68 tests y QA funcional PASS. P4 sigue pendiente; este cambio no implementa articulación de muebles.

## Petición contornos y UX (prioridad sobre P4)
- U1 geometríaV11 de polígonos, migración y límite de puerta: DONE (75 tests y QA).
- U2 presets fijos/móviles, arrastre y teclado: DONE.
- U3 interfaz minimalista, contraste, foco, panel contextual y vistas móviles: DONE (alcance probado; no certificación WCAG).
- U4 regresión, recuperación y publicación: DONE (75 tests, typecheck, build, QA y publicación SUCCEEDED).

U5 IN PROGRESS — dibujo tipo construcción por clic, miniaturas geométricas, paneles visuales y reorganización del espacio. Nueva prioridad antes de P4.

G1 IN PROGRESS — respaldo completo en GitHub privado `alfita133/mi-habitacion`: commit local realizado; BLOCKED por revisión automática del selector de privacidad GitHub; pendiente creación privada/push/confirmación HEAD. U5 sigue IN PROGRESS, con 78 pruebas y QA parcial; no marcar como publicado.
