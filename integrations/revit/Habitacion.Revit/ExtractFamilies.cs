using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.DB.Structure;
using Autodesk.Revit.UI;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Security.Cryptography;
using System.Drawing.Imaging;
using Forms=System.Windows.Forms;
namespace Habitacion.Revit;
[Transaction(TransactionMode.Manual)]
public class ExtractFamilies:IExternalCommand {
 public Result Execute(ExternalCommandData data,ref string message,ElementSet elements){
  using var pick=new Forms.OpenFileDialog{Filter="Familias Revit (*.rfa)|*.rfa",Multiselect=true};if(pick.ShowDialog()!=Forms.DialogResult.OK)return Result.Cancelled;
  using var save=new Forms.SaveFileDialog{Filter="Manifiesto (*.revit-families.json)|*.revit-families.json",FileName="biblioteca.revit-families.json"};if(save.ShowDialog()!=Forms.DialogResult.OK)return Result.Cancelled;
  var families=new JsonArray();var report=new List<string>();
  foreach(string path in pick.FileNames){Document? doc=null;try{
   if(new FileInfo(path).Length>8_000_000)throw new InvalidOperationException("Límite web: 8 MB por archivo.");
   doc=data.Application.Application.NewProjectDocument(UnitSystem.Metric);Family? family=null;Level? level=null;Wall? host=null;
   Bridge.Transaction(doc,"Preparar extracción",()=>{if(!doc.LoadFamily(path,out family)||family==null)throw new InvalidOperationException("No se pudo cargar RFA.");level=new FilteredElementCollector(doc).OfClass(typeof(Level)).Cast<Level>().FirstOrDefault()??Level.Create(doc,0);var wt=new FilteredElementCollector(doc).OfClass(typeof(WallType)).Cast<WallType>().First(w=>w.Kind==WallKind.Basic);host=Wall.Create(doc,Line.CreateBound(new XYZ(-20,0,0),new XYZ(20,0,0)),wt.Id,level.Id,20,0,false,false);});
   var fam=family!;var types=new JsonArray();string? thumbnail=null;var notes=new JsonArray("Dimensiones extraídas de la envolvente de una instancia; confirma las medidas reales. La web dibuja una caja, no la malla Revit.");
   string category=fam.FamilyCategory?.Id.Value==(long)BuiltInCategory.OST_Doors?"puertas":fam.FamilyCategory?.Id.Value==(long)BuiltInCategory.OST_Windows?"ventanas":Category(fam.Name);
   string placement=fam.FamilyPlacementType==FamilyPlacementType.OneLevelBased?"free":(fam.FamilyPlacementType==FamilyPlacementType.OneLevelBasedHosted&&(category=="puertas"||category=="ventanas"))?"wall":"unsupported";
   foreach(ElementId id in fam.GetFamilySymbolIds()){
    var symbol=(FamilySymbol)doc.GetElement(id);JsonObject? dimensions=null;var parameters=Bridge.Parameters(symbol,"type");
    using var t=new Transaction(doc,"Medir tipo temporal");t.Start();try{
     symbol.Activate();doc.Regenerate();FamilyInstance? instance=placement=="free"?doc.Create.NewFamilyInstance(XYZ.Zero,symbol,level!,StructuralType.NonStructural):placement=="wall"?doc.Create.NewFamilyInstance(XYZ.Zero,symbol,host!,level!,StructuralType.NonStructural):null;
     doc.Regenerate();if(instance!=null){var b=instance.get_BoundingBox(null);if(b!=null){dimensions=Bridge.Dimensions(b);if(new[]{"width","depth","height"}.Any(axis=>!double.IsFinite(Bridge.N(dimensions,axis))||Bridge.N(dimensions,axis)<=0||Bridge.N(dimensions,axis)>2000)){dimensions=null;notes.Add("Envolvente fuera del rango web; introduce medidas manuales.");}}foreach(var p in Bridge.Parameters(instance,"instance"))parameters.Add(p?.DeepClone());}
     if(thumbnail==null){using var bitmap=symbol.GetPreviewImage(new System.Drawing.Size(256,256));if(bitmap!=null){using var stream=new MemoryStream();bitmap.Save(stream,ImageFormat.Png);thumbnail="data:image/png;base64,"+Convert.ToBase64String(stream.ToArray());}}
    }catch(Exception e){notes.Add($"Tipo {symbol.Name}: {e.Message}".Substring(0,Math.Min(900,$"Tipo {symbol.Name}: {e.Message}".Length)));}finally{t.RollBack();}
    if(parameters.Count>300)throw new InvalidOperationException("Tipo con más de 300 parámetros: excede el contrato web.");
    types.Add(new JsonObject{["id"]=symbol.Name,["name"]=symbol.Name,["dimensionsCm"]=dimensions,["dimensionParameters"]=new JsonObject{["width"]=Bridge.DimensionKey(parameters,new[]{"Width","Ancho"}),["depth"]=Bridge.DimensionKey(parameters,new[]{"Depth","Fondo","Profundidad"}),["height"]=Bridge.DimensionKey(parameters,new[]{"Height","Alto","Altura"})},["parameters"]=parameters});
   }
   if(types.Count==0||types.Count>100||notes.Count>100)throw new InvalidOperationException("Cantidad de tipos o notas fuera de los límites web.");
   var bytes=File.ReadAllBytes(path);families.Add(new JsonObject{["id"]=Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(),["name"]=fam.Name,["category"]=category,["revitCategory"]=fam.FamilyCategory?.Name??"",["fileName"]=Path.GetFileName(path),["sourcePath"]=path,["status"]="processed",["revitVersion"]=data.Application.Application.VersionNumber,["placement"]=placement,["unit"]="cm",["originalBase64"]=Convert.ToBase64String(bytes),["thumbnail"]=thumbnail,["types"]=types,["notes"]=notes});
  }catch(Exception e){report.Add(Path.GetFileName(path)+": "+e.Message);}finally{doc?.Close(false);}}
  File.WriteAllText(save.FileName,new JsonObject{["format"]="habitacion.revit-families",["version"]=1,["families"]=families}.ToJsonString(new JsonSerializerOptions{WriteIndented=true}));
  File.WriteAllLines(save.FileName+".report.txt",report.Prepend($"Familias procesadas: {families.Count}"));TaskDialog.Show("Habitación",$"Procesadas: {families.Count}. Fallos: {report.Count}. Informe junto al manifiesto.");return Result.Succeeded;
 }
 private static string Category(string name){string n=name.ToLowerInvariant();foreach(var pair in new[]{("bed","camas"),("cama","camas"),("desk","escritorios"),("escritorio","escritorios"),("chair","sillas"),("silla","sillas"),("table","mesas"),("mesa","mesas"),("wardrobe","armarios"),("armario","armarios"),("shelf","estanterías"),("estanter","estanterías"),("light","iluminación"),("lamp","iluminación")})if(n.Contains(pair.Item1))return pair.Item2;return "decoración";}
}
