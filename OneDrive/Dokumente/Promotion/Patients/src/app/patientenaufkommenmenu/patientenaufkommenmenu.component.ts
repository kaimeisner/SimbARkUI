import { Component } from '@angular/core';
import {Area} from './../areas/Area';
import {Template} from './../areas/Template';
import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {MenuHelper} from './../menu/MenuHelper';
import { DayOfWeekService } from '../services/day-of-week.service';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-patientenaufkommenmenu',
  templateUrl: './patientenaufkommenmenu.component.html',
  styleUrls: ['./patientenaufkommenmenu.component.css']
})
export class PatientenaufkommenmenuComponent {
  canvas:any;
  context:any;
  objects: Array<Area> = [];
  marked: Array<Area> = [];
  mouseDownX:any = null;
  mouseDownY:any = null;
  response:any;
  template:String = "";
  width = 100;
  height = 100;
  multX = 0;
  multY = 0;

  constructor(
    private http: HttpClient,
    private httpService: HttpService,
    private cookie: CookieService,
    private daysOfWeekService: DayOfWeekService
  ) { }

  //erzeugt die Grafik und setzt die Links
  ngOnInit(){
    MenuHelper.setMenu(document, ["Zonen", "TemplateZonen", "ZonenAufbau"]);
    MenuHelper.setTemplateZonen(true);
    MenuHelper.setZonenAufbau(true);
    MenuHelper.setPatientenaufkommen(true);
    this.template = this.cookie.get("template");
    this.loadTemplate1(this.template);
  }

  //Setzt Groesse der Anzeige des Canvas
  private setCanvas(){
    if(document.getElementById("field") != null){
      this.canvas = document.getElementById("field");
      if(this.height < this.width){
        this.canvas.style.height = ""+Math.max(this.height/this.width*100, 70)+"%";
        this.canvas.style.width = "100%"
      }
      else{
          this.canvas.style.width = ""+Math.max((this.width/this.height)*100,70)+"%";
          this.canvas.style.height = "100%"
      }
      this.canvas = document.getElementById("field");
      this.canvas.width = 5000;
      this.canvas.height = 5000;
      this.multX = this.canvas.width/this.width;
      this.multY = this.canvas.height/this.height;
      this.context = this.canvas.getContext('2d');
    }
    else{
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
    }
    this.loadTemplate(this.template);
  }

  //Wählt das übergebene Feld aus
  //Durch alone wird entschieden, ob die anderen bereist markierten Felder markiert bleiben sollen.
  private select(area: Area, alone: boolean){
    if(alone){
      for(let i = 0; i < this.marked.length; i++){
        this.marked[i].marked = false;
        this.drawArea(this.marked[i]);
      }
      this.marked = [];
    }
    if(this.marked.indexOf(area) < 0){
      area.marked = true;
      this.drawArea(area);
      this.marked.push(area);
    }
    if(document.getElementById("soldiers")){
      (<HTMLInputElement>document.getElementById("soldiers")).value = ""+area.soldiers;
    }
  }

  //Zeichnet das Rechteck mit Text
  //marked setzt dabei die Farbe
  private drawRectangle(x_start:number, y_start:number, x_end:number , y_end:number, marked: boolean, done:boolean, name:String, soldiers:String){
      let dif_x = x_start - x_end;
      let dif_y = y_start - y_end;
      if(dif_x < 0) dif_x = dif_x * (-1);
      if(dif_y < 0) dif_y = dif_y * (-1);
      this.context.lineWidth = 10;
      this.context.fillStyle = "#00FF00";
      if(!done) this.context.fillStyle = "#FF0000";
      if(marked) this.context.fillStyle = "#B0FF00";
      if(!done && marked)  if(marked) this.context.fillStyle = "#FFB000";
      this.context.fillRect(x_start, y_start, dif_x, dif_y);
      this.context.strokeRect(x_start, y_start, dif_x, dif_y);
      this.context.font = "lighter 120px Arial";
      this.context.fillText("Name:",x_start+20,y_start+130);
      this.context.strokeText("Name:",x_start+20,y_start+130);
      this.context.strokeText(name,x_start+20,y_start+260);
      this.context.strokeText("Soldaten:",x_start+20,y_start+420);
      this.context.strokeText(soldiers,x_start+20,y_start+560);
  }

  //Zeichnet die Area
  private drawArea(area:Area){
    this.canvas = document.getElementById("field");
    this.drawRectangle(area.x1*this.multX, area.y1*this.multY, area.x2*this.multX, area.y2*this.multY, area.marked, area.patientenaufkommen != 0, area.name, ""+area.soldiers);
  }

  //Speichert die Mausposition beim drücken
  private mousedown(e:MouseEvent){
    let x = this.canvas.width/this.canvas.getBoundingClientRect().width*e.offsetX;
    let y = this.canvas.height/this.canvas.getBoundingClientRect().height*e.offsetY;
    this.mouseDownX = x;
    this.mouseDownY = y;
  }

  //Markiert die entsprechenden Felder
  private mouseup(e:MouseEvent){
    if(this.mouseDownX == null || this.mouseDownY == null){
      return;
    }
    let x = this.canvas.width/this.canvas.getBoundingClientRect().width*e.offsetX;
    let y = this.canvas.height/this.canvas.getBoundingClientRect().height*e.offsetY;
    let area = new Area(this.mouseDownX/this.multX, x/this.multX, this.mouseDownY/this.multY, y/this.multY, this.template, "", 0, 0);
    for(let i = 0; i < this.marked.length; i++){
      this.marked[i].marked = false;
      this.drawArea(this.marked[i]);
    }
    this.marked = [];
    for(let i = 0; i < this.objects.length; i++){
      if(this.objects[i].isInMarkedZone(area) || area.isInMarkedZone(this.objects[i])){
        this.select(this.objects[i],false);
      }
    }
    this.mouseDownY = null;
    this.mouseDownX = null;
  }

  private updateArea(area: Area, tableArea: Area){
    area = tableArea;
  }

    private delete(area: Area){
        this.http.get('http://localhost:8080/delete?id='+area.id).subscribe(data =>{this.response = data;
            });
    }

    private popArea(area:Area){
       let i = this.objects.indexOf(area);
       if(i >= 0) this.objects.splice(i,1);
    }

    //Lädt die Anzeige
    private loadTemplate(name:String){
      this.http.get('http://localhost:8080/getTemplate?template='+name).subscribe(data =>{
          let arr = <Array<Area>>data;
          for(let i = 0; i < arr.length; i++){
            let area = new Area(arr[i].x1, arr[i].x2, arr[i].y1, arr[i].y2, arr[i].template, arr[i].name, arr[i].soldiers, arr[i].patientenaufkommen);
            area.id = arr[i].id;
            this.objects.push(area);
            this.select(area,true);
          }
          if(this.objects.length < 1){
                let area: Area = new Area(0,100,0,100, this.template, "Zone1", 0, 0);
                area = this.save(area);
                this.select(area,true);
                this.objects.push(area)
          };
          let ready:boolean = true
          for(let i = 0; i < this.objects.length; i++){
            if(this.objects[i].patientenaufkommen == 0) ready = false;
          }
          if(ready){
             MenuHelper.setMenu(document, ["Zonen", "TemplateZonen", "ZonenAufbau", "Patientenaufkommen"]);
          }
                  });
    }

    //Speichert die Anzahl der Soldaten in eim´nem feld
     public saveSoldiers(){
       for(let i = 0; i < this.marked.length; i++){
          if(document.getElementById("soldiers") != null){
               let soldiers  = 0;
               soldiers = +(<HTMLInputElement>document.getElementById("soldiers")).value;
               this.marked[i].soldiers = soldiers;
               this.save(this.marked[i]);
           }
       }
     }

  //Speichert ein Feld in der Datenbank
  private save(area: Area){
    this.http.get('http://localhost:8080/add?id='+area.id+'&x1='+area.x1+'&x2='+area.x2+'&y1='+area.y1+'&y2='+area.y2+'&template='+this.template+'&name='+area.name+'&soldiers='+area.soldiers+'&patientenaufkommen='+area.patientenaufkommen).subscribe(data =>{this.response = data;
          let a:Area = <Area>data;
          area.id = a.id;
          this.drawArea(area);
          });
      return area;
  }

  private deleteAufkommenDatas(zoneID:String){
    this.http.get('http://localhost:8080/api/v1/aufkommen/deleteAufkommen?zoneID='+zoneID).subscribe(data =>{this.response = data;});
  }

  //Löscht die verbindung einem definertem Patientenaufkommen
  public deleteAufkommen(){
    for(let i = 0; i < this.marked.length; i++){
      let x = ""+this.marked[i].patientenaufkommen;
      this.marked[i].patientenaufkommen=0;
      this.save(this.marked[i]);
      this.deleteAufkommenDatas(x)
    }
  }

  //Öffnet das Patientenaufkommenfenster
  public update(){
    if(this.marked.length > 1) return;
    let cookieContent = "";
    for(let i = 0; i < this.marked.length; i++){
      cookieContent += /*"," + */this.marked[i].id;
    }
    this.daysOfWeekService.setZoneID(1);
    this.cookie.set("marked", cookieContent);
    window.open("/chart", "_self");
  }

  //Setzt die Mausevent und läd das Template
  private loadTemplate1(name:String){
        this.http.get('http://localhost:8080/getTemplateByName?name='+name).subscribe(data =>{
          let temp = <Template>data;
          this.width = temp.width;
          this.height = temp.height;
          this.setCanvas();
          this.canvas.addEventListener('mousedown', (event: MouseEvent) => {this.mousedown(event);});
          this.canvas.addEventListener('mouseup', (event: MouseEvent) => {this.mouseup(event);});
        });
      }
}
