# Revit — investigación y plan (2026-09-17)

## Decisión
Web local + intercambio por archivos + complemento Windows con API oficial. Sin parser binario RFA en JavaScript, sin APS, sin API ficticia, sin entrenamiento ni llamadas de pago. Originales base64 incrustados (8 MB por archivo,30 MB codificados por habitación) para que guardar/cargar/exportar no pierda las familias. Catálogo por habitación; duplicar habitación duplica lógicamente el catálogo. JSON ProjectV6, migración explícita V1–V5 sin pérdida.

## Fuentes comprobadas
- [Autodesk: unidades internas y UnitUtils](https://help.autodesk.com/cloudhelp/2025/ENU/Revit-API/files/Revit_API_Developers_Guide/Introduction/Application_and_Document/Revit_API_Revit_API_Developers_Guide_Introduction_Application_and_Document_Units_html.html): longitudes en pies, ángulos en radianes; conversión explícita.
- [Autodesk: transición .NET 8 a .NET 10 en Revit2025/2026](https://aps.autodesk.com/blog/call-preview-testing-revit-20262025-migration-net-10): baseline2026/net8 y comprobación de actualización instalada; no prometer compatibilidad automática.
- [Repositorio del SDK Revit](https://github.com/jeremytammik/RevitSdkSamples): documentación y ejemplos de la API para validación en Windows. No se distribuyen DLL del SDK.
- [Ejemplo original de extracción de previsualizaciones, The Building Coder](https://jeremytammik.github.io/tbc/a/0359_preview_image.htm): ElementType.GetPreviewImage puede devolver miniatura para FamilySymbol; no todos los tipos la tienen.

Parte de los enlaces profundos de la ayuda no se resolvió en este entorno. La preparación utiliza las APIs indicadas, pero la comprobación definitiva de firmas y comportamiento corresponde a compilación contra las DLL instaladas y pruebas reales. No hay dotnet ni Windows/Revit aquí; el complemento no se declara validado.

## Fases
R0 DONE: arquitectura/contrato y compatibilidad de entorno.
R1 DONE: biblioteca web, originales pendientes, importación de manifiestos procesados, búsqueda/categorías/tipos/parametrización/colocación y sugerencias locales deterministas con revisión. Los volúmenes son aproximaciones medidas, no mallas RFA renderizadas.
R2 BLOCKED para verificación Windows: código C# independiente preparado (extracción, creación de estructura, carga, colocación compatible, parámetros, informe, snapshot). Pendiente compilar y probar en Windows.
R3 BLOCKED por entorno: certificación de funcionamiento real, adaptación a hospedajes adicionales, extracción de mallas detalladas y retorno de cambios Revit→web. El export actual devuelve snapshot original y lo etiqueta así.

## Próxima acción exacta
R1 y F5.4 verificados: 40 tests, typecheck, lint y QA navegador (fixtures sintéticos); publicación registrada en PROJECT_STATE.md. En siguiente sesión Windows: indicar versión/actualización de Revit, compilar integrations/revit/Habitacion.Revit y ejecutar matriz README. Registrar resultados antes de marcar R2 DONE. No añadir objetos ni contratar un proveedor IA automáticamente.

## Sugerencias
Asistente inicial basado en términos (habitación, estudio, trabajo, lectura), categorías existentes y catálogo importado. Solo ofrece revisar candidatos o informa qué categoría falta. No se presenta como LLM. Modelo de IA opcional futuro solo con proveedor real verificado; la interfaz y decisión explícita de añadir son independientes del proveedor.

## Compatibilidad ProjectV11 — contornos libres
El intercambio conserva el contorno poligonal completo. El importador C# acepta V6–V11 solo para habitaciones rectangulares. Rechaza expresamente polígonos antes de iniciar la transacción, sin sustituirlos por un rectángulo. La generación de muros/suelo/techo poligonales en Revit queda pendiente; el complemento sigue sin compilar ni probar en Windows.
