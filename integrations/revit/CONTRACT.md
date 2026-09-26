# Contrato 1

## Proyecto de intercambio

`.habitacion.json` admite ProjectV6 directamente (Exportar copia), o el sobre:

```json
{"format":"habitacion.revit-project","version":1,"coordinateSystem":"cm-x-right-y-down-z-up-centerXY-baseZ","project":{},"roomDimensionsCm":{"width":400,"depth":350,"height":260}}
```

`project` debe contener el ProjectV6 completo, no `{}`; el ejemplo solo ilustra el sobre. `project.room.dimensions` es la fuente de verdad con prioridad manualCm > estimatedCm > defaultCm. roomDimensionsCm es un resumen, no una fuente alternativa. Cada objeto mantiene posición XY centro/Zbase, rotationDeg, dimensiones, initialHeightCm, hidden, groupId y `revit:{familyId,typeId,parameters:{key:value}}`. Aperturas conservan wallId/offset/sill y el mismo binding Revit opcional. Project.families contiene el catálogo referenciado. Referencias inválidas se rechazan en web.

## Manifiesto de familias

`.revit-families.json`:

```json
{"format":"habitacion.revit-families","version":1,"families":[]}
```

Se necesita al menos1 familia para importar en web. Cada familia:

- id (extractor: SHA256 hexadecimal del original), name, category, revitCategory;
- fileName .rfa, sourcePath informativa; status processed; revitVersion;
- placement free/wall/unsupported; unit cm; originalBase64 nullable; thumbnail PNG data URI nullable;
- notes[], types[]: {id,name,dimensionsCm:{width,depth,height}|null,dimensionParameters:{width:key|null,depth:key|null,height:key|null},parameters:[]}.
- parameters: {key,name,scope:type|instance,storage:string|integer|double|boolean,unit:cm|deg|number|text|boolean|unsupported,readOnly,value}.
- key es scope:name. Parámetros no resolubles de manera unívoca se marcan readonly; no se usa ID local de parámetro como si fuera universal. Names compartidos entre familias no implican identidad.
- Cambios de parámetros en web se guardan por instancia; dimensiones mapeadas se sobrescriben con las medidas del objeto al importar Revit.

El extractor produce bbox y miniatura cuando puede; no promete una malla detallada. No hay geometría inventada. Un original sin procesar se guarda con status pending y types vacío; no se puede colocar.

ActualizaciónV7: importador preparado aceptaV6/V7. Opening.swing se conserva en snapshot e informa que no se aplica a familia todavía. No equiparar ángulo web con parámetro Revit universal. Sin compilación/ejecución Windows.

ActualizaciónV8: room.fixedVolumes se conserva en snapshot y se reporta como no representado en Revit. Importador aceptaV6/V7/V8; no elimina datos nuevos silenciosamente ni promete creación de esas mallas.

## ProjectV9
Aceptado por importador; assets son referencias externas preservadas en snapshot e informadas como no importadas. El complemento abre .habitacion.json, NO .habitacion.pack. La web mantiene originales RFA embebidos en intercambio JSON. Hojas configuradas y obstáculos interiores V7/V8 se preservan/informan, no se convierten automáticamente en familias/geometría Revit. Fuente no compilada en este entorno.

## ProjectV10
Importador acepta V10 y conserva model compound en snapshot. Piezas de la web no modifican geometría RFA: informe explícito. Objetos sin binding siguen omitiéndose con informe; no crear una familia ficticia. Revit de Windows sigue sin compilar/probar en este entorno.

## Compatibilidad ProjectV11 — contornos libres
El intercambio conserva el contorno poligonal completo. El importador C# acepta V6–V11 solo para habitaciones rectangulares. Rechaza expresamente polígonos antes de iniciar la transacción, sin sustituirlos por un rectángulo. La generación de muros/suelo/techo poligonales en Revit queda pendiente; el complemento sigue sin compilar ni probar en Windows.
