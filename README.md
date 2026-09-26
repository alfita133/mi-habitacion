# Mi habitación

Editor personal web de habitaciones con plano2D y vista3D sincronizados, contornos rectangulares/poligonales, medidas reales, objetos por piezas, avisos de colisión, estructura editable y guardado local de varias habitaciones.

## Continuar en Codex
Leer [AGENTS.md](AGENTS.md), [PROJECT_STATUS.md](PROJECT_STATUS.md), [REQUIREMENTS.md](REQUIREMENTS.md) y [ARCHITECTURE.md](ARCHITECTURE.md). Contienen requisitos consolidados, evidencia del código, límites, decisiones y siguiente tarea exacta sin necesitar el chat de Work.

Estado: ProjectV11; U5 dibujo por clic y galería visual implementados pero pendientes de cerrar QA. Fotos/GLB/IA aún no implementados y pausados por el usuario. Biblioteca Revit web disponible; complementoWindows preparado, no compilado/probado.

## Ejecutar
Node>=22.13; auditado conNode24.19. pnpm11.25.0 según packageManager y lockfile.

```sh
pnpm install --frozen-lockfile
pnpm dev
# http://localhost:5173
pnpm test
pnpm typecheck
pnpm build
```

El perfilportable se elige automáticamente en un clon nuevo. Desarrollo local no requiere credenciales de Sites ni motoresIA. Comprobaciones de traspaso:78tests, typecheck, build y arranqueHTTP200; no instalaciónWindows ni QAWebGL completa.

## Datos y uso
- Habitación inicial vacía400×350×260cm: ejemplo, no medición. Introducir medidas reales; manual prevalece sobre estimaciones/ejemplos.
- Dibujar permite clic-esquinas, cierre, edición y contornos cóncavos. Añadir objeto abre biblioteca de muebles y elementos estructurales diferenciados; drag al plano o clic/Enter.
- Seleccionar muestra controles; XY centro, Z base. Altura del objeto y elevación son distintas. Grupos/ocultación/atajos y giros15/45/90 disponibles.
- Colisiones se avisan en rojo sin bloquear. Ocultos siguen físicos. Hoja/arco de puerta solo referencia; apertura limitada por paredes (limitación actual de espesor en PROJECT_STATUS).
- SVGRenderer compatible si no hayWebGL2; perspectiva real sin texturas/sombras.
- Habitaciones guardadas en IndexedDB del navegador y origen. **Git no contiene tus habitaciones reales.** Exportar cada habitación desde la app anterior y abrir su copia en la nueva. No borrar datos anteriores hasta verificar.
- Copia completa `.habitacion.pack`; JSON histórico aceptado; intercambioRevit `.habitacion.json`. Sin sincronización automática entre dispositivos.

## Revit y publicación
Ver [integrations/revit/README.md](integrations/revit/README.md). `.rfa` se guarda pendiente hasta procesarlo con APIoficial enWindows; no se interpreta binario en navegador. C# actual rechaza habitaciones poligonales, omite incompatibilidades con informe y no sincroniza cambiosRevit de vuelta.
El repositorioGitHub tiene el código actual; la publicaciónSites acreditada esV11, anterior aU5. Migrar código no despliega cambios. Estado y pruebas detalladas en PROJECT_STATUS y docs/TESTING.md.
