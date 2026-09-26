using Autodesk.Revit.DB;
using System.Text.Json.Nodes;
namespace Habitacion.Revit;
internal static class Bridge {
 public static string Text(JsonNode n,string key)=>n[key]?.GetValue<string>()??"";
 public static double N(JsonNode n,string key)=>n[key]?.GetValue<double>()??0;
 public static double Measure(JsonNode n)=>n["manualCm"]?.GetValue<double>()??n["estimatedCm"]?.GetValue<double>()??n["defaultCm"]!.GetValue<double>();
 public static double Ft(double cm)=>UnitUtils.ConvertToInternalUnits(cm,UnitTypeId.Centimeters);
 public static double Cm(double ft)=>UnitUtils.ConvertFromInternalUnits(ft,UnitTypeId.Centimeters);
 public static XYZ Point(double x,double y,double z)=>new(Ft(x),-Ft(y),Ft(z));
 public static JsonObject Dimensions(BoundingBoxXYZ b)=>new(){["width"]=Cm(b.Max.X-b.Min.X),["depth"]=Cm(b.Max.Y-b.Min.Y),["height"]=Cm(b.Max.Z-b.Min.Z)};
 public static JsonArray Parameters(Element element,string scope){
  var items=new JsonArray();var names=new HashSet<string>();
  foreach(Parameter p in element.Parameters){
   string name=p.Definition.Name,key=scope+":"+name;if(!names.Add(name))continue;
   var spec=p.Definition.GetDataType();string unit="unsupported",storage="string";JsonNode? value=JsonValue.Create(p.AsValueString()??"");
   if(p.StorageType==StorageType.String){unit="text";value=JsonValue.Create(p.AsString()??"");}
   else if(p.StorageType==StorageType.Integer){bool boolean=spec==SpecTypeId.Boolean.YesNo;unit=boolean?"boolean":"number";storage=boolean?"boolean":"integer";value=boolean?JsonValue.Create(p.AsInteger()!=0):JsonValue.Create(p.AsInteger());}
   else if(p.StorageType==StorageType.Double){storage="double";double v=p.AsDouble();if(spec==SpecTypeId.Length){unit="cm";v=Cm(v);}else if(spec==SpecTypeId.Angle){unit="deg";v=v*180/Math.PI;}else if(spec==SpecTypeId.Number)unit="number";value=JsonValue.Create(v);}
   items.Add(new JsonObject{["key"]=key,["name"]=name,["scope"]=scope,["storage"]=storage,["unit"]=unit,["readOnly"]=p.IsReadOnly||unit=="unsupported"||element.GetParameters(name).Count!=1,["value"]=value});
  }return items;
 }
 public static string? DimensionKey(JsonArray parameters,string[] names)=>parameters.OfType<JsonObject>().FirstOrDefault(p=>names.Contains(Text(p,"name"),StringComparer.OrdinalIgnoreCase)&&Text(p,"unit")=="cm"&&p["readOnly"]?.GetValue<bool>()==false)?["key"]?.GetValue<string>();
 public static void SetParameter(Element target,JsonNode definition,JsonNode value){
  string name=Text(definition,"name"),unit=Text(definition,"unit");var matches=target.GetParameters(name);if(matches.Count!=1)throw new InvalidOperationException($"Parámetro ausente/ambiguo: {name}");var p=matches[0];if(p.IsReadOnly||unit=="unsupported")throw new InvalidOperationException($"Parámetro no editable: {name}");
  var actualSpec=p.Definition.GetDataType();string storage=Text(definition,"storage");
  if(definition["readOnly"]?.GetValue<bool>()==true||
    (storage=="string"&&p.StorageType!=StorageType.String)||
    ((storage=="integer"||storage=="boolean")&&p.StorageType!=StorageType.Integer)||
    (storage=="double"&&p.StorageType!=StorageType.Double)||
    (unit=="cm"&&actualSpec!=SpecTypeId.Length)||
    (unit=="deg"&&actualSpec!=SpecTypeId.Angle)||
    (unit=="boolean"&&actualSpec!=SpecTypeId.Boolean.YesNo)||
    (unit=="number"&&storage=="double"&&actualSpec!=SpecTypeId.Number))throw new InvalidOperationException($"Tipo/unidad incompatible: {name}");
  bool ok=storage switch {
   "string"=>p.Set(value.GetValue<string>()),"boolean"=>p.Set(value.GetValue<bool>()?1:0),"integer"=>p.Set(value.GetValue<int>()),
   "double"=>p.Set(unit=="cm"?Ft(value.GetValue<double>()):unit=="deg"?value.GetValue<double>()*Math.PI/180:value.GetValue<double>()),_=>false};
  if(!ok)throw new InvalidOperationException($"Revit rechazó {name}");
 }
 public static void Transaction(Document doc,string name,Action action){using var t=new Transaction(doc,name);t.Start();var options=t.GetFailureHandlingOptions();options.SetFailuresPreprocessor(new AbortErrors());options.SetClearAfterRollback(true);t.SetFailureHandlingOptions(options);try{action();if(t.Commit()!=TransactionStatus.Committed)throw new InvalidOperationException(name+": transacción rechazada por Revit.");}catch{if(t.GetStatus()==TransactionStatus.Started)t.RollBack();throw;}}
 private class AbortErrors:IFailuresPreprocessor {public FailureProcessingResult PreprocessFailures(FailuresAccessor a){foreach(var f in a.GetFailureMessages())if(f.GetSeverity()==FailureSeverity.Error)return FailureProcessingResult.ProceedWithRollBack;return FailureProcessingResult.Continue;}}
}
