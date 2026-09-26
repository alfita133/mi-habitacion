# Instrucciones permanentes para Codex

## Recuperación obligatoria
1. Leer `PROJECT_STATUS.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md` y este archivo antes de modificar código.
2. Leer `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md` y `docs/DATA_MODEL.md` para contratos y contexto histórico. Las cuatro guías raíz consolidadas el 26-09-2026 describen el estado vigente; en los documentos históricos hay fases sustituidas, no órdenes para restaurarlas.
3. Revisar `git status`, rama/remotos, últimos commits y el código citado como evidencia. Si hay cambios ajenos, preservarlos. No asumir que se dispone de esta conversación.
4. Continuar la **siguiente tarea exacta** de `PROJECT_STATUS.md`. Si código y documentación discrepan, comprobar y actualizar ambos estados antes de afirmar éxito.

## Objetivo y alcance
Editor personal web de habitaciones: plano 2D y visor 3D sobre el mismo modelo; medidas reales prioritarias; futuro gemelo digital a partir de varias fotos. Español, funcionalidad y facilidad de uso; responder al usuario de forma concisa.
- Varias habitaciones independientes y biblioteca pequeña de elementos/familias están autorizadas. La antigua prohibición de múltiples habitaciones y catálogos quedó sustituida.
- Sin multiusuario, cuentas propias, red social, marketplace, optimización de decoración o ergonomía. No eliminar indiscriminadamente infraestructura de Sites heredada.
- **No iniciar importación de fotos, importación GLB ni integración de IA** sin nueva instrucción que levante la pausa expresa del usuario. Investigación y geometría manual ya realizadas no autorizan instalar motores.
- No desarrollar nuevas funciones durante el traspaso; este checkpoint solo consolida documentación y verifica el código.

## Invariantes del producto
- Centímetros. Origen arriba a la izquierda de la envolvente del suelo. X derecha, Y profundidad hacia abajo del plano, Z altura. Objetos: XY centro, Z base. Three usa (X,Z,Y), giro con signo negativo. Revit usa (X,-Y,Z)/30.48 y giro negativo en radianes.
- `manualCm > estimatedCm > defaultCm`. Nunca inventar medidas reales, alterar medidas manuales para favorecer aspecto ni promover una estimación a real silenciosamente.
- Colisiones y salida de límites de muebles/fijos son **avisos rojos**, no bloqueos de colocación/guardado. Formatos inválidos, dimensiones no válidas, contornos cruzados y huecos estructurales imposibles sí se rechazan.
- Puerta: hoja y arco son referencia visual, sin colisión con muebles; al abrirse debe detenerse ante paredes. El límite actual usa eje de hoja y tiene una limitación de espesor documentada.
- Puertas/ventanas son estructura editable/movible sobre pared; volúmenes fijos tienen edición y borrado protegido. No convertirlos en muebles para reutilizar un inspector.
- Ocultos siguen contando físicamente; conjuntos conservan piezas y medidas. No confundir agrupar con fusionar mallas.
- Habitación poligonal real compartida por 2D/3D/colisiones. Nunca exportarla como rectángulo a escondidas.
- Un RFA binario no se interpreta en navegador: pendiente hasta procesarlo mediante Revit oficial. C# preparado no equivale a complemento compilado/probado.
- Primitivas, plantillas y miniaturas son aproximaciones, no reconstrucciones fotográficas ni modelos exactos de fabricante.

## Arquitectura y cambios
Mantener UI, dominio, geometría, renderizadores, colisiones, persistencia y Revit separados. No crear un estado paralelo para 2D/3D. No mover lógica física a componentes de presentación. Los módulos futuros de imágenes/reconstrucción aún no existen.
Validar propuestas completas antes de aplicarlas. Si cambia el contrato: incrementar versión, migrar todas las versiones admitidas, preservar IDs/fuentes/activos/bindings y probar guardado/carga. No añadir campos que el importador descarte silenciosamente.
Historial: una interacción de arrastre = un paso; las operaciones nuevas deben respetar undo/redo y guardado. Cámara/selección/transitorios no son datos del proyecto.
Evitar dependencias complejas; comprobar viabilidad de tecnologías importantes antes de instalarlas. Gratis y local es requisito para el futuro flujo básico de fotos. Consultar investigación existente y revalidar precios/capacidades antes de usar servicios.
Cambios visuales adicionales que no se hayan pedido: proponerlos al usuario antes de aplicarlos. Los cambios ya autorizados de U5 no necesitan nueva confirmación.

## Verificación y checkpoints
Comandos en `PROJECT_STATUS.md` y README. Después de un cambio relevante: pruebas dirigidas, typecheck, ejecutar app cuando cambie UI, verificar funciones previas afectadas, actualizar estado/roadmap/decisiones y commit pequeño. No marcar DONE solo por escribir código o porque tests unitarios pasen; distinguir pruebas automatizadas, inspección, QA anterior y QA pendiente.
Registrar bugs y limitaciones sin ocultar warnings. Si falta Windows/Revit/WebGL, declararlo. Antes de agotar contexto, cerrar un punto consistente, guardar, verificar y escribir una siguiente tarea concreta.
No guardar secretos, `.env`, credenciales, fotos privadas, habitaciones reales, `node_modules`, builds o temporales en Git.

## Git y despliegue
Repositorio de continuidad: https://github.com/alfita133/mi-habitacion, rama `main`, público por autorización expresa. Trabajar sobre su historial. El historial previo de Work/Sites es distinto: no forzar push ni mezclarlo automáticamente.
En un clon nuevo, `origin` será GitHub. En el checkout antiguo de Work, `origin` es Sites y `github` GitHub; comprobar siempre remotos. Identidad del sitio existente en `.openai/hosting.json`; conservarla si se usa Sites. No hace falta acceso a Work para desarrollar con el perfil portable.
La migración de código no mueve IndexedDB ni fotos/archivos privados del usuario. Se exportan/importan desde la app por separado. No afirmar que el código GitHub ya está desplegado: U5 aún no tiene publicación acreditada.
