# Habitación ↔ Revit — integración inicial

Estado: código fuente preparado; **no compilado ni ejecutado en Revit en este entorno Linux**. No es un complemento certificado ni un instalador. La web sí se verifica por separado. Antes de usar un RVT real, compilar y ejecutar la matriz de prueba en un documento de prueba.

## Plataforma

Base dirigida a Revit de escritorio **2026, Windows x64 y .NET 8**. Revit 2027 usa otro runtime; no mezclar sus DLL. Autodesk ha anunciado migración de actualizaciones de 2025/2026 a .NET 10: comprobar el runtime de la instalación exacta antes de compilar. El proyecto permite configurar `TargetFramework`, `RevitYear` y `RevitPath`, pero eso no acredita compatibilidad API entre versiones. Revit LT/Revit Web no están soportados.

## Preparación y compilación en Windows

1. Instalar Revit 2026 y SDK .NET 8 con herramientas de escritorio Windows.
2. Extraer esta carpeta; conservar los originales .rfa fuera de la carpeta de código.
3. Ejecutar PowerShell desde esta carpeta:

```powershell
dotnet build .\Habitacion.Revit\Habitacion.Revit.csproj -c Release -p:RevitYear=2026 '-p:RevitPath=C:\Program Files\Autodesk\Revit 2026'
```

4. Copiar DLL y dependencias generadas de `bin\Release\net8.0-windows` a `C:\Habitacion`.
5. Revisar las tres rutas Assembly en `Habitacion.Revit.addin` y copiarlo a `%APPDATA%\Autodesk\Revit\Addins\2026`.
6. Iniciar Revit, abrir un RVT de prueba y usar Complementos → Herramientas externas. No se modifica la instalación ni se distribuyen DLL propietarias de Autodesk.

## Flujo

- Web → Familias Revit → importar .rfa. Solo verifica extensión/cabecera y guarda bytes; no los interpreta.
- Descargar original si solo se dispone de la copia web. En Revit ejecutar **Procesar familias RFA** y seleccionar los originales.
- Se abre un proyecto temporal por familia, se carga con `Document.LoadFamily`, se enumeran `FamilySymbol`, parámetros y miniatura cuando exista. Para tipos libres o puertas/ventanas hospedadas se intenta medir una instancia temporal. El documento temporal se cierra sin guardar.
- Volver a la web → Importar datos procesados → `.revit-families.json`. Los originales idénticos reemplazan sus registros pendientes. Las dimensiones no disponibles se dejan vacías para introducirlas manualmente.
- Elegir tipo, confirmar medidas/posición, editar parámetros y pulsar Añadir a habitación. La web dibuja **cajas aproximadas** y huecos; no mallas detalladas Revit.
- Exportar para Revit descarga `.habitacion.json` con proyecto, catálogo y originales incrustados. Abrir copia en la web admite tanto ese sobre como JSON V1–V6.
- En Revit ejecutar **Importar habitación**. Crea nuevos niveles, muros, suelo y techo; agrega instancias compatibles. No actualiza una importación anterior. Para repetir usar un documento nuevo o deshacer la importación anterior.
- Si no hay original incrustado, busca el nombre .rfa al lado del JSON. La ruta Windows original se conserva como metadato, pero no se abre automáticamente ni se siguen rutas de red. Los originales incrustados se extraen temporalmente; se verifica SHA256 cuando el identificador procede del extractor.
- Informe `.revit-report.txt` junto al JSON: familias/tipos/hospedajes/parámetros ausentes, dimensiones no reproducibles, grupos incompletos. Una instancia incompatible se revierte sin cancelar las demás.

## Garantía dimensional y límites concretos

- Intercambio cm; Revit pies mediante UnitUtils. Origen del suelo, +X a derecha, +Y hacia abajo en plano, +Z arriba. Revit `(x/30.48, -y/30.48, z/30.48)` y giro `-rotationDeg` en radianes. Se recentra la envolvente XY y baseZ de la instancia antes de girar.
- La web mantiene medidas manuales. El importador asigna medidas a parámetros dimensionales mapeados, aplica los demás y regenera. Si la envolvente resultante difiere más de 0.5 cm, **omite e informa**; no escala arbitrariamente ni redefine una medida real.
- Los mapeos Width/Ancho, Depth/Fondo/Profundidad y Height/Alto/Altura son heurísticas por nombre y solo para parámetros de longitud editables. Revisarlos en el manifiesto antes de importar familias personalizadas. Envolventes pueden incluir geometría auxiliar; la comprobación conservadora puede rechazar familias válidas.
- Tipos libres OneLevelBased y puertas/ventanas OneLevelBasedHosted constituyen la primera ruta. Familias por cara, techo, adaptativas, líneas y dos niveles quedan informadas como incompatibles. Iluminación por techo puede planificarse en web, pero necesita el adaptador de anfitrión siguiente.
- Categorías de puerta/ventana se detectan por categoría Revit; las demás se clasifican por nombre como ayuda inicial. Confirmar y corregir en el manifiesto cuando sea necesario.
- Cada instancia utiliza una copia de tipo para que modificar sus parámetros de tipo no cambie otras instancias.
- Puertas/ventanas permanecen en `fixedElements` y se mueven sobre muros, sin tratarlas como muebles agrupables. Las puertas mantienen base0. Colisiones de muebles solo avisan; huecos inválidos siguen rechazados.
- Muros se extienden hacia fuera para conservar interior. Tipos de suelo/techo proceden del RVT; si no existen, falla la estructura de manera explícita. No crea una entidad Room BIM ni materiales/texturas equivalentes todavía.
- Ocultación Revit solo en vista activa. Agrupación se intenta con instancias importadas, con informe si no es posible. Los objetos sin familia se omiten (los huecos sin familia sí se crean).
- **Exportar snapshot original** devuelve exactamente el JSON guardado al importar. No incorpora modificaciones posteriores realizadas en Revit. El retorno bidireccional de esas modificaciones es R3, pendiente; el comando lo indica expresamente.
- No se usa APS ni APIs pagadas, no se suben originales a un servidor. Límite web8 MB por .rfa,40 familias,30 MB en originales/miniaturas codificados por habitación; copiaJSON40 MB. Se conserva base64 para portabilidad a costa de tamaño.

## Matriz obligatoria de validación pendiente (R3)

- Compilar con DLL/runtime de la instalación; corregir incompatibilidades reales antes de distribuir un binario.
- Extraer cama/escritorio libre, puerta de muro y ventana; revisar unidades, tipos, cabecera, miniatura y manifiesto aceptado por web.
- Medir bbox con origen excéntrico y giro30/90°, baseZ elevada y suelo/techo interiores; comprobar parámetro de tipo aislado entre dos instancias.
- RFA nuevo incompatible, inexistente, tipo ausente, parámetros ambiguos/readonly/formulados y hospedaje por cara: informe y continuación sin confirmar éxito falso.
- Verificar fallos diferidos de transacción, grupos, ocultación, semántica de sill/offset en distintas familias.
- Comparar medidas de huecos hospedados, punto de inserción, offset Z y orientación en las cuatro paredes: no dar por probado solo por leer código.
- Exportar snapshot → web conserva todo; implementar y verificar retorno de cambios hechos en Revit por separado.

Consultar CONTRACT.md y docs/REVIT_INTEGRATION.md del repositorio para decisiones y fuentes.

## Compatibilidad ProjectV11 — contornos libres
El intercambio conserva el contorno poligonal completo. El importador C# acepta V6–V11 solo para habitaciones rectangulares. Rechaza expresamente polígonos antes de iniciar la transacción, sin sustituirlos por un rectángulo. La generación de muros/suelo/techo poligonales en Revit queda pendiente; el complemento sigue sin compilar ni probar en Windows.
