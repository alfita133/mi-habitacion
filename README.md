# Mi habitación

Editor personal incremental con varias habitaciones guardadas, plano 2D y vista 3D sincronizados, medidas reales, muebles, conjuntos, huecos estructurales, IndexedDB y copias JSON V6 con migración desde V1–V5.

## Continuar el desarrollo
Leer en este orden:
1. docs/PROJECT_STATE.md
2. docs/ROADMAP.md
3. docs/ARCHITECTURE.md
4. docs/DECISIONS.md
5. docs/DATA_MODEL.md

Después inspeccionar `git status`, últimos commits y la siguiente tarea exacta. La aplicación completa todavía NO está terminada. No hay importación ni análisis de fotografías todavía.

## Ejecutar
Node >=22.13 y pnpm según `packageManager` en package.json.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
```

En el entorno Work gestionado, usar el flujo Sites y `node "$SITES_PNPM_BIN"` en lugar de `pnpm` si este no está en PATH. Preview para QA: `sites-preview start /workspace/sites/mi-habitacion`; al finalizar `sites-preview stop`. En otra máquina usar `pnpm dev` (detección de perfil mediante scripts del proyecto).

## Uso
- Los 400 × 350 × 260 cm iniciales son un ejemplo.
- Introducir ancho, largo y alto reales en cm, con punto o coma decimal, y pulsar Aplicar medidas.
- Orbitar con arrastre, zoom con rueda/pellizco y desplazar con botón derecho/dos dedos. Centrar restaura cámara.
- Añadir hueco permite definir una puerta o ventana indicando su pared A/B/C/D, ancho, alto y posición. Las puertas no incluyen hoja móvil todavía.
- Los huecos se pueden editar y eliminar con confirmación; no pueden solaparse ni quedar fuera de la pared.
- Las paredes cercanas y el techo se pueden ocultar solo en la visualización.
- Exportar copia descarga JSON de las medidas aplicadas. Abrir copia valida el formato y añade otra habitación sin sustituir la actual.
- El guardado es local al navegador y origen. Para pasar del móvil al PC, exportar/importar. Borrar datos del navegador elimina esa copia local.
- Si no hay WebGL2, se utiliza 3D vectorial real, sin texturas ni sombras. La vista fotorrealista requiere una futura fase de materiales y reconstrucción, además de un navegador compatible.

## Validación
Consultar docs/TESTING.md. Dominio y mallas se prueban con Node. No se ha medido aún el rendimiento con muebles ni fotos reales.

## Hito actual
- Mis habitaciones: crear, abrir, renombrar, duplicar y eliminar con confirmación; miniaturas del plano. La habitación anterior se conserva automáticamente.
- Ampliar/restaurar plano o 3D con sus iconos: prioriza una vista dentro de la página, sin pantalla completa del navegador.
- Seleccionar muestra acciones y propiedades; Editar habitación abre medidas y estructura. Objetos abre la lista y permite añadir volúmenes medidos.
- Ctrl+clic selecciona varias unidades. Arrastrar en plano o elevar en3D mueve la selección; ocultar/unir y copiar/cortar/pegar funcionan sobre ella.
- Ctrl/Cmd+C/X/V/Z/Y; undo/redo100pasos. Historial y clipboard se reinician al cambiar habitación o recargar. Alto inicial de objetos antiguos = alto al migrar.
- Avisos rojos sin bloquear movimientos o guardado. Cajas aproximadas; obstáculos fijos y fotografías pendientes. Exportación individual por habitación.
- Guardado local; usar una sola pestaña para editar. No hay sincronización entre dispositivos.

## Familias Revit
Panel Familias Revit: importar `.rfa` (queda pendiente), descargar original, procesar mediante complemento Windows e importar su `.revit-families.json`. Elegir tipo, confirmar medidas, editar parámetros y añadir explícitamente. Sugerencias locales por reglas; nunca colocación automática. Las cajas web son aproximaciones medidas. Puertas/ventanas siguen siendo estructura y pueden moverse en plano/cambiar pared.

Exportar para Revit descarga `.habitacion.json` portable con originales y bindings. Código del complemento y guía en `integrations/revit` y descargables desde el panel. **Preparado, no compilado ni probado en Windows/Revit**. Ver `docs/REVIT_INTEGRATION.md`. El retorno actual es snapshot original, no sincroniza cambios posteriores en Revit.
