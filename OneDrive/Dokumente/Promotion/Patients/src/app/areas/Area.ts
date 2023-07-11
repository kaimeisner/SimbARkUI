export class Area{
  id:number = 0;
  template:String;
  x1:number;
  x2:number;
  y1:number;
  y2:number;
  marked:boolean = false;
  name:string;
  soldiers:number;
  patientenaufkommen:number;

  //Erstellt ein Object, wobei x1 < x2 und y1 < y2 gilt.
  constructor(x1:number, x2:number, y1:number , y2:number, template:String, name:string, soldiers:number, patientenaufkommen:number){
    this.template = template;
    this.name = name;
    this.soldiers = soldiers
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.patientenaufkommen = patientenaufkommen;
    if(x1 > x2){
      this.x1 = x2;
      this.x2 = x1;
    }
    if(y1 > y2){
      this.y1 = y2;
      this.y2 = y1;
    }
  }

  //Ueberprüft, ob ein Punkt in dem Rechteck ist
  public isIn(x:number, y:number):boolean{
    return(x >= this.x1 && y >= this.y1 && x <= this.x2 && y <= this.y2);
  }

  public getTemplate():String{
    return this.template;
  }

  //Ueberprueft, ob das Feld in der markierten Zone liegt
  public isInMarkedZone(zone: Area){
      return(zone.isIn(this.x1, this.y1) || zone.isIn(this.x1, this.y2) || zone.isIn(this.x2, this.y1) || zone.isIn(this.x2, this.y2) ||
              this.isIn(zone.x1, zone.y1) || this.isIn(zone.x1, zone.y2) || this.isIn(zone.x2, zone.y1) || this.isIn(zone.x2, zone.y2) ||
              (this.y1 > zone.y1 && this.y2 < zone.y2 && this.x1 < zone.x1 && this.x2 > zone.x2)
              );
  }

  //Teil das Feld in zwei n gleich grosse Teil
  //vert gibt an, ob vertikal oder horizontal gespalten werden soll
  public split(vert: boolean, number: number):Array<Area>{
    let areas = [];
    if(vert){
      var x = Math.min(this.x1,this.x2)
      var dx = (this.x1 - this.x2)/number;
      if(dx < 0) dx = -dx;
      for(let i = 1; i <= number; i++){
        if(i == number){
          areas.push(new Area(x, Math.max(this.x1, this.x2), this.y1, this.y2, this.template, "", this.soldiers, this.patientenaufkommen));
        }
        else {
          areas.push(new Area(x, x+dx, this.y1, this.y2, this.template, "", this.soldiers, this.patientenaufkommen))
          x = x + dx;
        }
      }
    }
    else{
      var y = Math.min(this.y1,this.y2)
      var dy = (this.y1 - this.y2)/number;
      if(dy < 0) dy = -dy;
      for(let i = 1; i <= number; i++){
        if(i == number) {
          areas.push(new Area(this.x1, this.x2, y, Math.max(this.y1, this.y2), this.template, "", this.soldiers, this.patientenaufkommen));
        }
        else{
          areas.push(new Area(this.x1, this.x2, y, y+dy, this.template, "", this.soldiers, this.patientenaufkommen));
          y = y+dy;
        }
      }
    }
    return areas;
  }

  //Ueberprueft, ob das gegebene Rechteck sich dieses Feld berührt
  public getCommonEdge(area:Area):Array<number>{
    if(this.x1 == area.x1 && this.x2 == area.x2 || this.x1 == area.x2 && this.x2 == area.x1){
      if(this.y1 == area.y1) return [2,2];
      if(this.y1 == area.y2) return [2,3];
      if(this.y2 == area.y1) return [3,2];
      if(this.y2 == area.y2) return [3,3];
    }
    if(this.y1 == area.y1 && this.y2 == area.y2 || this.y1 == area.y2 && this.y2 == area.y1){
      if(this.x1 == area.x1) return [0,0];
      if(this.x1 == area.x2) return [0,1];
      if(this.x2 == area.x1) return [1,0];
      if(this.x2 == area.x2) return [1,1];
    }
    return [-1];
  }

  public equals(obj:Area):boolean{
    return ((this.x1 == obj.x1 && this.x2 == obj.x2 && this.y1 == obj.y1 && this.y2 == obj.y2) || (this.id == obj.id));
  }
}
