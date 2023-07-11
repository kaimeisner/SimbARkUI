export abstract class MenuHelper{
  static templateZonen:boolean = true;
  static zonenAufbau:boolean = false;
  static patientenaufkommen = false;


  /*
    Zeigt an,  welche Schritte schon erledigt sind
  */
  public static setMenu(document:Document, toSet:Array<String>){
        let icons = ["Zonen", "TemplateZonen", "ZonenAufbau", "Patientenaufkommen"];
        for(let i = 0; i < icons.length; i++){
            let element = document.getElementById(icons[i]);
            if(element == null) element = document.createElement(icons[i]);
            if(toSet.indexOf(icons[i]) >= 0) element.innerHTML = "done";
            else element.innerHTML = "schedule";
        }
  }

  /*
    enables/disables die entsprechenden Links
  */
  public static setTemplateZonen(linked:boolean){ MenuHelper.templateZonen = linked;}
  public static setZonenAufbau(linked:boolean){ MenuHelper.zonenAufbau = linked;}
  public static setPatientenaufkommen(linked:boolean){ MenuHelper.patientenaufkommen = linked;}
}
