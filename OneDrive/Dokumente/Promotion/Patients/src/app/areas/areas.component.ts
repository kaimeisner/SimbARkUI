import { Component } from '@angular/core';
import {Area} from './Area';
import {Template} from './Template';
import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {MenuHelper} from './../menu/MenuHelper';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.css']
})
@Injectable({providedIn: 'root'})
export class AreasComponent {
  canvas:any;
  context:any;
  move:boolean = false;
  objects: Array<Area> = [];
  marked: Array<Area> = [];
  toMove: Array<Area> = [];
  mouseDownX:any = null;
  mouseDownY:any = null;
  response:any;
  template:String = "";
  oldWidth=100;
  oldHeight=100;
  multX = 0;
  multY = 0;

  constructor(private http: HttpClient, private cookie:CookieService){
  }

  //erzeugt die Grafik und setzt die Links
  ngOnInit(){
    MenuHelper.setMenu(document, ["TemplateZonen"]);
    MenuHelper.setTemplateZonen(true);
    MenuHelper.setZonenAufbau(true);
    MenuHelper.setPatientenaufkommen(true);
    this.template = this.cookie.get("template");
    this.loadTemplate1(this.template);
    window.addEventListener('mousemove', (event: MouseEvent) => {this.mouse(event);});
  }

  //Setzt Groesse der Anzeige des Canvas
  private setCanvas(name:String){
    if(document.getElementById("width") != null && document.getElementById("height") != null){
        (<HTMLInputElement>document.getElementById("width")).value = ""+this.oldWidth;
        (<HTMLInputElement>document.getElementById("height")).value = ""+this.oldHeight;
    }
    if(document.getElementById("field") != null){
      this.canvas = document.getElementById("field");
      if(this.oldHeight < this.oldWidth){
        this.canvas.style.height = ""+Math.max(this.oldHeight/this.oldWidth*100, 60)+"%";
        this.canvas.style.width = "100%"
        this.canvas.width = 5000;
        this.canvas.height = 50*Math.max(this.oldHeight/this.oldWidth*100, 60);
      }
      else{
          this.canvas.style.width = ""+Math.max((this.oldWidth/this.oldHeight)*100,60)+"%";
          this.canvas.style.height = "100%";
          this.canvas.width = 50*Math.max((this.oldWidth/this.oldHeight)*100,60);
          this.canvas.height = 5000;
      }
      this.multX = this.canvas.width/this.oldWidth;
      this.multY = this.canvas.height/this.oldHeight;
      this.context = this.canvas.getContext('2d');
    }
    else{
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
    }
    this.loadTemplate(name);
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
    if(document.getElementById("name") != null){
      (<HTMLInputElement>document.getElementById("name")).value = area.name;
    }
  }

  //Zeichnet das Rechteck mit Text
  //marked setzt dabei die Farbe
  private drawRectangle(x_start:number, y_start:number, x_end:number , y_end:number, marked: boolean, name:String){
      let dif_x = x_start - x_end;
      let dif_y = y_start - y_end;
      if(dif_x < 0) dif_x = dif_x * (-1);
      if(dif_y < 0) dif_y = dif_y * (-1);
      this.context.lineWidth = 10;
      this.context.fillStyle = "#00FF00";
      if(marked) this.context.fillStyle = "#B0FF00";
      this.context.fillRect(x_start, y_start, dif_x, dif_y);
      this.context.strokeRect(x_start, y_start, dif_x, dif_y);
      this.context.font = "lighter 120px Arial";
      if(Math.abs(y_start-y_end) > 300 && Math.abs(x_start-x_end) > 400){
        this.context.fillText("Name:",x_start+20,y_start+130);
        this.context.strokeText("Name:",x_start+20,y_start+130);
        this.context.fillText(name,x_start+20,y_start+240);
        this.context.strokeText(name,x_start+20,y_start+240);
      }
  }

  //Zeichnet die Area
  private drawArea(area:Area){
    this.canvas = document.getElementById("field");
    this.drawRectangle(area.x1*this.multX, area.y1*this.multY, area.x2*this.multX, area.y2*this.multY, area.marked, area.name);
  }

  //Teilt die markierten Felder
  public split(){
    let num=1;
    let vert=false;
    if(document.getElementById("splits") != null){
      num = +(<HTMLInputElement>document.getElementById('splits')).value;
      if(num < 0){
        num = 1;
      }
    }
     if(document.getElementById("select") != null){
      vert = "Horizontal" != (<HTMLSelectElement>document.getElementById('select')).value;
    }
    let areas:Array<Area> = [];
    for(let i = 0; i < this.marked.length; i++){
      areas = this.marked[i].split(vert, num);
      this.popArea(this.marked[i]);
      this.delete(this.marked[i]);

      for(let j = 0; j < areas.length; j++){
        this.drawArea(areas[j]);
        areas[j] = this.save(areas[j]);
        this.objects.push(areas[j]);
      }
    }
    this.marked = [];
    this.checkRules(0);
    this.select(areas[0], false);
  }

  //Überprüft, ob die Maus das Canvas verlässt
  //Wenn es der Fall ist, werden die Werte der mouseDown auf null gesetzt
  private mouse(e:MouseEvent){
    if(this.mouseDownX != null && this.mouseDownY != null && this.move){
      let left:number = this.canvas.getBoundingClientRect().left;
      let right:number = this.canvas.getBoundingClientRect().right;
      let top:number = this.canvas.getBoundingClientRect().top;
      let bottom:number = this.canvas.getBoundingClientRect().bottom;
      let x = e.clientX;
      let y = e.clientY;
      if(x < left || x > right || y < top || y > bottom){
          this.mouseDownX = null;
          this.mouseDownY = null;
          if(Math.abs(this.toMove[0].x1 - this.toMove[0].x2)*this.multX < 40 || Math.abs(this.toMove[0].y1 - this.toMove[0].y2)*this.multY < 40 ||
            Math.abs(this.toMove[1].x1 - this.toMove[1].x2)*this.multX < 40 || Math.abs(this.toMove[1].y1 - this.toMove[1].y2)*this.multY < 40){
            this.select(this.toMove[0],true);
            this.select(this.toMove[1],false)
            this.mouseDownY = null;
            this.mouseDownX = null;
            this.move = false;
            this.unit();
            return;
          }
          this.finishMove();
      }
    }
  }

  //Setzt die Punkte an denen die Maus geklicht wurde
  private mousedown(e:MouseEvent){
    let x = this.canvas.width/this.canvas.getBoundingClientRect().width*e.offsetX;
    let y = this.canvas.height/this.canvas.getBoundingClientRect().height*e.offsetY;
    this.mouseDownX = x;
    this.mouseDownY = y;
    this.move = false;
    this.toMove = [];
    let y1 = this.canvas.height/this.canvas.getBoundingClientRect().height*this.objects[2].y2;
    for(let i = 0; i < this.objects.length; i++){
      if(((Math.abs(this.objects[i].x1*this.multX - x) < 40 || Math.abs(this.objects[i].x2*this.multX - x) < 40) &&
            Math.min(this.objects[i].y1*this.multY, this.objects[i].y2*this.multY) < y && Math.max(this.objects[i].y1*this.multY, this.objects[i].y2*this.multY) > y)
        || ((Math.abs(this.objects[i].y1*this.multY - y) < 40 || Math.abs(this.objects[i].y2*this.multY - y) < 40)
         && Math.min(this.objects[i].x1*this.multX, this.objects[i].x2*this.multX) < x && Math.max(this.objects[i].x1*this.multX, this.objects[i].x2*this.multX) > x)){
          this.toMove.push(this.objects[i]);
          this.move = true;
        }
    }
    if(this.toMove.length != 2 ||
          !((Math.min(this.toMove[0].x1, this.toMove[0].x2) == Math.min(this.toMove[1].x1, this.toMove[1].x2) &&
              Math.max(this.toMove[0].x1, this.toMove[0].x2) == Math.max(this.toMove[1].x1, this.toMove[1].x2))||
          (Math.min(this.toMove[0].y1, this.toMove[0].y2) == Math.min(this.toMove[1].y1, this.toMove[1].y2) &&
                        Math.max(this.toMove[0].y1, this.toMove[0].y2) == Math.max(this.toMove[1].y1, this.toMove[1].y2)))){
      this.move = false;
      this.toMove = [];
      if(this.toMove.length > 2){
        this.mouseDownY = null;
        this.mouseDownX = null;
      }

    }
  }

  //Trackt die MousPosition
  //Verschiebt gegebenenfalls die Grenzen der Felder
  private mousemove(e:MouseEvent){
    if(this.move){
      let x = this.canvas.width/this.canvas.getBoundingClientRect().width*e.offsetX;
      let y = this.canvas.height/this.canvas.getBoundingClientRect().height*e.offsetY;

      if(Math.min(this.toMove[0].x1, this.toMove[0].x2) == Math.min(this.toMove[1].x1, this.toMove[1].x2) &&
        Math.max(this.toMove[0].x1, this.toMove[0].x2) == Math.max(this.toMove[1].x1, this.toMove[1].x2)){
         let newY0 = 0;
         let newY1 = 0;
         if(this.toMove[0].y1 == this.toMove[1].y1){
           newY0 = this.toMove[0].y1 + (y - this.mouseDownY)/this.multY;
           newY1 = this.toMove[1].y1 + (y - this.mouseDownY)/this.multY;
           if(!((this.toMove[0].y2 < this.toMove[0].y1 && newY0 < this.toMove[0].y2) || (this.toMove[0].y2 > this.toMove[0].y1 && newY0 > this.toMove[0].y2) ||
               (this.toMove[1].y1 < this.toMove[1].y2 && newY1 > this.toMove[1].y2) || (this.toMove[1].y1 > this.toMove[1].y2 && newY1 < this.toMove[1].y2))){
             this.toMove[0].y1 = newY0;
             this.toMove[1].y1 = newY1;
           }
           else{
             this.select(this.toMove[0],true);this.select(this.toMove[1],false);
            this.mouseDownY = null;
            this.mouseDownY = null;
            this.move = false;
             this.unit();
             return;
           }
         }
         else if(this.toMove[0].y1 == this.toMove[1].y2){
           newY0 = this.toMove[0].y1 + (y - this.mouseDownY)/this.multY;
           newY1 = this.toMove[1].y2 + (y - this.mouseDownY)/this.multY;
           if(!((this.toMove[0].y2 < this.toMove[0].y1 && newY0 < this.toMove[0].y2) || (this.toMove[0].y2 > this.toMove[0].y1 && newY0 > this.toMove[0].y2) ||
               (this.toMove[1].y1 < this.toMove[1].y2 && newY1 < this.toMove[1].y1) || (this.toMove[1].y1 > this.toMove[1].y2 && newY1 > this.toMove[1].y1))){
             this.toMove[0].y1 = newY0;
             this.toMove[1].y2 = newY1;
           }
           else{
             this.select(this.toMove[0],true);this.select(this.toMove[1],false);
            this.mouseDownY = null;
            this.mouseDownY = null;
            this.move = false;
             this.unit();
             return;
           }
         }
         else if(this.toMove[0].y2 == this.toMove[1].y1){
           newY0 = this.toMove[0].y2 + (y - this.mouseDownY)/this.multY;
           newY1 = this.toMove[1].y1 + (y - this.mouseDownY)/this.multY;
           if(!((this.toMove[0].y2 < this.toMove[0].y1 && newY0 > this.toMove[0].y1) || (this.toMove[0].y2 > this.toMove[0].y1 && newY0 < this.toMove[0].y1) ||
             (this.toMove[1].y1 < this.toMove[1].y2 && newY1 > this.toMove[1].y2) || (this.toMove[1].y1 > this.toMove[1].y2 && newY1 < this.toMove[1].y2))){
             this.toMove[0].y2 = newY0;
             this.toMove[1].y1 = newY1;
           }
           else{
             this.select(this.toMove[0],true);this.select(this.toMove[1],false);
            this.mouseDownY = null;
            this.mouseDownY = null;
            this.move = false;
             this.unit();
             return;
           }
         }
         else if(this.toMove[0].y2 == this.toMove[1].y2){
           newY0 = this.toMove[0].y2 + (y - this.mouseDownY)/this.multY;
           newY1 = this.toMove[1].y2 + (y - this.mouseDownY)/this.multY;
           if(!((this.toMove[0].y2 < this.toMove[0].y1 && newY0 > this.toMove[0].y1) || (this.toMove[0].y2 > this.toMove[0].y1 && newY0 < this.toMove[0].y1) ||
               (this.toMove[1].y1 < this.toMove[1].y2 && newY1 < this.toMove[1].y1) || (this.toMove[1].y1 > this.toMove[1].y2 && newY1 < this.toMove[1].y1))){
             this.toMove[0].y2 = newY0;
             this.toMove[1].y2 = newY1;
           }
           else{
             this.select(this.toMove[0],true);this.select(this.toMove[1],false);
             this.mouseDownY = null;
             this.mouseDownY = null;
             this.move = false;
             this.unit();
             return;
           }
         }
         this.drawArea(this.toMove[0]);
         this.drawArea(this.toMove[1]);
      }
      else{
        let newX0 = 0;
        let newX1 = 0;
        if(this.toMove[0].x1 == this.toMove[1].x1){
          newX0 = this.toMove[0].x1 + (x - this.mouseDownX)/this.multX;
          newX1 = this.toMove[1].x1 + (x - this.mouseDownX)/this.multX;
          if(!((this.toMove[0].x2 < this.toMove[0].x1 && newX0 < this.toMove[0].x2) || (this.toMove[0].x2 > this.toMove[0].x1 && newX0 > this.toMove[0].x2) ||
             (this.toMove[1].x1 < this.toMove[1].x2 && newX1 > this.toMove[1].x2) || (this.toMove[1].x1 > this.toMove[1].x2 && newX1 < this.toMove[1].x2))){
            this.toMove[0].x1 = newX0;
            this.toMove[1].x1 = newX1;
          }
          else{
            this.select(this.toMove[0],true);this.select(this.toMove[1],false);
           this.mouseDownY = null;
           this.mouseDownX = null;
           this.move = false;
            this.unit();
            return;
          }
        }
        else if(this.toMove[0].x1 == this.toMove[1].x2){
          newX0 = this.toMove[0].x1 + (x - this.mouseDownX)/this.multX;
          newX1 = this.toMove[1].x2 + (x - this.mouseDownX)/this.multX;
          if(!((this.toMove[0].x2 < this.toMove[0].x1 && newX0 < this.toMove[0].x2) || (this.toMove[0].x2 > this.toMove[0].x1 && newX0 > this.toMove[0].x2) ||
               (this.toMove[1].x1 < this.toMove[1].x2 && newX1 < this.toMove[1].x1) || (this.toMove[1].x1 > this.toMove[1].x2 && newX1 > this.toMove[1].x1))){
            this.toMove[0].x1 = newX0;
            this.toMove[1].x2 = newX1;
          }
          else{
            this.select(this.toMove[0],true);this.select(this.toMove[1],false);
           this.mouseDownY = null;
           this.mouseDownX = null;
           this.move = false;
            this.unit();
            return;
          }
        }
        else if(this.toMove[0].x2 == this.toMove[1].x1){
          newX0 = this.toMove[0].x2 + (x - this.mouseDownX)/this.multX;
          newX1 = this.toMove[1].x1 + (x - this.mouseDownX)/this.multX;
          if(!((this.toMove[0].x2 < this.toMove[0].x1 && newX0 > this.toMove[0].x1) || (this.toMove[0].x2 > this.toMove[0].x1 && newX0 < this.toMove[0].x1) ||
            (this.toMove[1].x1 < this.toMove[1].x2 && newX1 > this.toMove[1].x2) || (this.toMove[1].x1 > this.toMove[1].x2 && newX1 < this.toMove[1].x2))){
            this.toMove[0].x2 = newX0;
            this.toMove[1].x1 = newX1;
          }
          else{
            this.select(this.toMove[0],true);this.select(this.toMove[1],false);
           this.mouseDownY = null;
           this.mouseDownX = null;
           this.move = false;
            this.unit();
            return;
          }
        }
        else{
          newX0 = this.toMove[0].x2 + (x - this.mouseDownX)/this.multX;
          newX1 = this.toMove[1].x2 + (x - this.mouseDownX)/this.multX;
          if(!((this.toMove[0].x2 < this.toMove[0].x1 && newX0 > this.toMove[0].x1) || (this.toMove[0].x2 > this.toMove[0].x1 && newX0 < this.toMove[0].x1) ||
               (this.toMove[1].x1 < this.toMove[1].x2 && newX1 < this.toMove[1].x1) || (this.toMove[1].x1 > this.toMove[1].x2 && newX1 > this.toMove[1].x1))){
            this.toMove[0].x2 = newX0;
            this.toMove[1].x2 = newX1;
          }
          else{
            this.select(this.toMove[0],true);this.select(this.toMove[1],false);
            this.mouseDownY = null;
            this.mouseDownX = null;
            this.move = false;
            this.unit();
            return;
          }
        }
        this.drawArea(this.toMove[0]);
        this.drawArea(this.toMove[1]);
      }
      this.mouseDownY = y;
      this.mouseDownX = x;
    }
  }

  //Markiert gegebenenfalls die ausgewählten Felder
  private mouseup(e:MouseEvent){
    if(this.move){
      this.finishMove();
      return;
    }
    if(this.mouseDownX == null || this.mouseDownY == null){
      this.mouseDownX = null;
      this.mouseDownY = null;
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

  //Speichert die verschobenen Grenzen in der Datenbank
  private finishMove(){
    this.mouseDownY = null;
    this.mouseDownX = null;
    this.move = false;
    this.select(this.marked[0],true);
    this.checkRules(0);
    this.save(this.toMove[0]);
    this.save(this.toMove[1]);
  }

  //Vereint die markierten Felder, sofern sie ein Rechteck ergeben
  public unit(){
    if(this.marked.length == 1) return;
    let oldMarked:Array<Area> = [];
    for(let i = 0; i < this.marked.length; i++){
      let area = new Area(this.marked[i].x1, this.marked[i].x2, this.marked[i].y1, this.marked[i].y2, this.template, this.marked[i].name, this.marked[i].soldiers, this.marked[i].patientenaufkommen);
      oldMarked.push(area)
    }
    let potentialRectangle:boolean = true;
    let addItem:Area = new Area(0,0,0,0, this.template, "", 100, 0);
    while(potentialRectangle){
      potentialRectangle = false;
      let found:Array<Area> = [];
      let toAdd:Array<Area> = [];
      for(let i = 0; i < this.marked.length; i++){
        for(let j = 0; j < this.marked.length; j++){
          if(i==j || found.indexOf(this.marked[i])>= 0 || found.indexOf(this.marked[j])>= 0) continue;
          let pos = this.marked[i].getCommonEdge(this.marked[j]);
          if(pos[0] != -1){
            let area = new Area(Math.min(this.marked[i].x1, this.marked[i].x2, this.marked[j].x1, this.marked[j].x2),
                                  Math.max(this.marked[i].x1, this.marked[i].x2, this.marked[j].x1, this.marked[j].x2),
                                  Math.min(this.marked[i].y1, this.marked[i].y2, this.marked[j].y1, this.marked[j].y2),
                                  Math.max(this.marked[i].y1, this.marked[i].y2, this.marked[j].y1, this.marked[j].y2),
                                  this.template, this.marked[i].name, this.marked[i].soldiers + this.marked[j].soldiers, 0);
            found.push(this.marked[i]);
            found.push(this.marked[j]);
            toAdd.push(area);
            potentialRectangle = true
          }
        }
      }
      for(let i = 0; i < found.length; i++){
        this.marked.splice(this.marked.indexOf(found[i]),1);
        this.popArea(found[i]);
        this.delete(found[i]);
      }
      for(let i = 0; i < toAdd.length; i++){
        addItem = toAdd[i];
        this.select(toAdd[i], false);
      }
    }
    if(this.marked.length == 1) {
      addItem = this.save(addItem)
      this.objects.push(addItem);
      this.checkRules(0);
      this.select(addItem, true);
      return;
    }
    for(let i = 0; i < this.marked.length; i++){
      this.popArea(this.marked[i]);
      this.delete(this.marked[i]);
    }
    this.marked = [];
    for(let i = 0; i < oldMarked.length; i++){
      oldMarked[i] = this.save(oldMarked[i]);
      this.objects.push(oldMarked[i]);
      this.select(oldMarked[i], false);
    }
    alert("Die Zonen konnten nicht verbunden werden, da sie kein Rechteck ergeben");
  }

  private updateArea(area: Area, tableArea: Area){
    area = tableArea;
  }

    //Löscht ein Feld aus der Datenbank
    private delete(area: Area){
        let zoneID = ""+area.patientenaufkommen;
        this.http.get('http://localhost:8080/api/v1/aufkommen/deleteAufkommen?zoneID='+zoneID).subscribe(data =>{this.response = data;});
        this.http.get('http://localhost:8080/delete?id='+area.id).subscribe(data =>{this.response = data;
            });
    }

    private popArea(area:Area){
       let i = this.objects.indexOf(area);
       if(i >= 0) this.objects.splice(i,1);
    }

    //Das entsprechende Template wird geladen
    //MouseEvents werden definert
    private loadTemplate1(name:String){
      this.http.get('http://localhost:8080/getTemplateByName?name='+name).subscribe(data =>{
        let temp = <Template>data;
        this.oldWidth = temp.width;
        this.oldHeight = temp.height;
        this.setCanvas(name);
        this.canvas.addEventListener('mousedown', (event: MouseEvent) => {this.mousedown(event);});
        this.canvas.addEventListener('mouseup', (event: MouseEvent) => {this.mouseup(event);});
        this.canvas.addEventListener('mousemove', (event: MouseEvent) => {this.mousemove(event);});
      });
    }

    //Zeigt das geladene Template an
    private loadTemplate(name:String){
      this.objects= [];
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
          this.checkRules(0);
      });
    }

    //Speichert den Namen des Feldes in der Datenbank
    public saveName(){
      for(let i = 0; i < this.marked.length; i++){
         if(document.getElementById("name") != null){
              let name  = (<HTMLInputElement>document.getElementById("name")).value;
              this.marked[i].name = name;
              this.drawArea(this.marked[i]);
              this.save(this.marked[i]);
          }
      }
    }

  //Speichert die Area in der Datenbank
  private save(area: Area){
    this.http.get('http://localhost:8080/add?id='+area.id+'&x1='+area.x1+'&x2='+area.x2+'&y1='+area.y1+'&y2='+area.y2+'&template='+this.template+'&name='+area.name+'&soldiers='+area.soldiers+'&patientenaufkommen='+area.patientenaufkommen).subscribe(data =>{this.response = data;
          let a:Area = <Area>data;
          area.id = a.id;
          });
      return area;
  }

  //Speichert die Größe des Gesamtfeldes in der Datenbank
  public saveSize(){
    if(document.getElementById("width") && document.getElementById("height")){
      for(let i = 0; i < this.marked.length; i++){
          this.marked[i].marked = false;
          this.drawArea(this.marked[i]);
      }
      this.marked = [];
      let width = 0;
      width = +(<HTMLInputElement>document.getElementById("width")).value;
      let height = 0;
      height = +(<HTMLInputElement>document.getElementById("height")).value;
      let w = width/this.oldWidth;
      let h = height/this.oldHeight;
      for(let i = 0; i < this.objects.length; i++){
        let id = this.objects[i].id;
        this.objects[i] = new Area(this.objects[i].x1*w, this.objects[i].x2*w, this.objects[i].y1*h, this.objects[i].y2*h,
                            this.objects[i].template, this.objects[i].name, this.objects[i].soldiers, this.objects[i].patientenaufkommen);
        this.objects[i].id = id;
        this.save(this.objects[i]);
      }
      this.oldHeight = height;
      this.oldWidth = width;
      this.multX = this.canvas.width/this.oldWidth;
      this.multY = this.canvas.height/this.oldHeight;
      this.http.get('http://localhost:8080/overwriteTemplate?name='+this.template+"&height="+height+"&width="+width).subscribe(data =>{this.response = data;
        window.open("/areas", "_self");
      });
    }
  }

  //Überprüft die Aufteilung auf Richtigkeit/ richtige Zuodnung
  private checkRules(rep:number){
      for(let i = 0; i < this.objects.length; i++){
        let valid:boolean = false;
        for(let j = 0; j < this.objects.length; j++){
          if(i != j){
            if(this.objects[i].y1 == 0 || this.objects[j].y2 == 0) valid = true;
            if(this.objects[i].y1 < this.objects[i].y2){
              if(this.objects[i].y1 == this.objects[j].y1 || this.objects[i].y1 == this.objects[j].y2){
                if((this.objects[i].x1 >= this.objects[j].x1 && this.objects[i].x2 <= this.objects[j].x2)||
                  (this.objects[i].x1 >= this.objects[j].x2 && this.objects[i].x2 <= this.objects[j].x1)) {
                    valid = true;
                }
                else if(Math.abs(this.objects[i].x1 - this.objects[j].x1)*this.multX < 40 && rep == 0){
                  for(let k = 0; k < this.objects.length; k++){
                    if(Math.min(this.objects[j].y1, this.objects[j].y2) == Math.min(this.objects[k].y1, this.objects[k].y2) &&
                    Math.max(this.objects[j].y1, this.objects[j].y2) == Math.max(this.objects[k].y1, this.objects[k].y2)){
                      if(this.objects[j].x1 == this.objects[k].x1){
                        this.objects[k].x1 = this.objects[i].x1;
                        this.drawArea(this.objects[k])
                      }
                      else if(this.objects[j].x1 == this.objects[k].x2){
                        this.objects[k].x2 = this.objects[i].x1;
                        this.drawArea(this.objects[k])
                      }
                    }
                  }
                }
                else if(Math.abs(this.objects[i].x2 - this.objects[j].x2)*this.multX < 40  && rep == 0){
                  for(let k = 0; k < this.objects.length; k++){
                    if(Math.min(this.objects[j].y1, this.objects[j].y2) == Math.min(this.objects[k].y1, this.objects[k].y2) &&
                    Math.max(this.objects[j].y1, this.objects[j].y2) == Math.max(this.objects[k].y1, this.objects[k].y2)){
                      if(this.objects[j].x2 == this.objects[k].x1){
                        this.objects[k].x1 = this.objects[i].x2;
                        this.drawArea(this.objects[k])
                      }
                      else if(this.objects[j].x2 == this.objects[k].x2){
                        this.objects[k].x2 = this.objects[i].x2;
                        this.drawArea(this.objects[k])
                      }
                    }
                  }
                }
                else if(Math.abs(this.objects[i].x1 - this.objects[j].x2)*this.multX < 40  && rep == 0){
                  for(let k = 0; k < this.objects.length; k++){
                    if(Math.min(this.objects[j].y1, this.objects[j].y2) == Math.min(this.objects[k].y1, this.objects[k].y2) &&
                    Math.max(this.objects[j].y1, this.objects[j].y2) == Math.max(this.objects[k].y1, this.objects[k].y2)){
                      if(this.objects[j].x2 == this.objects[k].x1){
                        this.objects[k].x1 = this.objects[i].x1;
                        this.drawArea(this.objects[k])
                      }
                      else if(this.objects[j].x2 == this.objects[k].x2){
                        this.objects[k].x2 = this.objects[i].x1;
                        this.drawArea(this.objects[k])
                      }
                    }
                  }
                }
                else if(Math.abs(this.objects[i].x2 - this.objects[j].x1)*this.multX < 40  && rep == 0){
                  for(let k = 0; k < this.objects.length; k++){
                    if(Math.min(this.objects[j].y1, this.objects[j].y2) == Math.min(this.objects[k].y1, this.objects[k].y2) &&
                    Math.max(this.objects[j].y1, this.objects[j].y2) == Math.max(this.objects[k].y1, this.objects[k].y2)){
                      if(this.objects[j].x1 == this.objects[k].x1){
                        this.objects[k].x1 = this.objects[i].x2;
                        this.drawArea(this.objects[k])
                      }
                      else if(this.objects[j].x1 == this.objects[k].x2){
                        this.objects[k].x2 = this.objects[i].x2;
                        this.drawArea(this.objects[k])
                      }
                    }
                }
                }
              }
            }
            else{
              if(this.objects[i].y2 == this.objects[j].y1 || this.objects[i].y2 == this.objects[j].y2) {
                if((this.objects[i].x1 >= this.objects[j].x1 && this.objects[i].x2 <= this.objects[j].x2)||
                  (this.objects[i].x1 >= this.objects[j].x2 && this.objects[i].x2 <= this.objects[j].x1)) {
                    valid = true;
                }
                else if(Math.abs(this.objects[i].x1 - this.objects[j].x1)*this.multX < 40 && rep == 0){
                  for(let k = 0; k < this.objects.length; k++){
                    if(Math.min(this.objects[j].y1, this.objects[j].y2) == Math.min(this.objects[k].y1, this.objects[k].y2) &&
                    Math.max(this.objects[j].y1, this.objects[j].y2) == Math.max(this.objects[k].y1, this.objects[k].y2)){
                      if(this.objects[j].x1 == this.objects[k].x1){
                        this.objects[k].x1 = this.objects[i].x1;
                        this.drawArea(this.objects[k])
                      }
                      else if(this.objects[j].x1 == this.objects[k].x2){
                        this.objects[k].x2 = this.objects[i].x1;
                        this.drawArea(this.objects[k])
                      }
                    }
                  }
                }
                else if(Math.abs(this.objects[i].x2 - this.objects[j].x2)*this.multX < 40  && rep == 0){
                  for(let k = 0; k < this.objects.length; k++){
                    if(Math.min(this.objects[j].y1, this.objects[j].y2) == Math.min(this.objects[k].y1, this.objects[k].y2) &&
                    Math.max(this.objects[j].y1, this.objects[j].y2) == Math.max(this.objects[k].y1, this.objects[k].y2)){
                      if(this.objects[j].x2 == this.objects[k].x1){
                        this.objects[k].x1 = this.objects[i].x2;
                        this.drawArea(this.objects[k])
                      }
                      else if(this.objects[j].x2 == this.objects[k].x2){
                        this.objects[k].x2 = this.objects[i].x2;
                        this.drawArea(this.objects[k])
                      }
                    }
                  }
                }
                else if(Math.abs(this.objects[i].x1 - this.objects[j].x2)*this.multX < 40  && rep == 0){
                  for(let k = 0; k < this.objects.length; k++){
                    if(Math.min(this.objects[j].y1, this.objects[j].y2) == Math.min(this.objects[k].y1, this.objects[k].y2) &&
                    Math.max(this.objects[j].y1, this.objects[j].y2) == Math.max(this.objects[k].y1, this.objects[k].y2)){
                      if(this.objects[j].x2 == this.objects[k].x1){
                        this.objects[k].x1 = this.objects[i].x1;
                        this.drawArea(this.objects[k])
                      }
                      else if(this.objects[j].x2 == this.objects[k].x2){
                        this.objects[k].x2 = this.objects[i].x1;
                        this.drawArea(this.objects[k])
                      }
                    }
                  }
                }
                else if(Math.abs(this.objects[i].x2 - this.objects[j].x1)*this.multX < 40  && rep == 0){
                  for(let k = 0; k < this.objects.length; k++){
                    if(Math.min(this.objects[j].y1, this.objects[j].y2) == Math.min(this.objects[k].y1, this.objects[k].y2) &&
                    Math.max(this.objects[j].y1, this.objects[j].y2) == Math.max(this.objects[k].y1, this.objects[k].y2)){
                      if(this.objects[j].x1 == this.objects[k].x1){
                        this.objects[k].x1 = this.objects[i].x2;
                        this.drawArea(this.objects[k])
                      }
                      else if(this.objects[j].x1 == this.objects[k].x2){
                        this.objects[k].x2 = this.objects[i].x2;
                        this.drawArea(this.objects[k])
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if(!valid && this.objects.length > 1){
          if(document.getElementById("info") != null){
             (<HTMLElement>document.getElementById("info")).innerText = "Die Felder sind noch nicht eindeutig zugeordnet. Die Kanten müssen noch verschoben werden";
              MenuHelper.patientenaufkommen = false;
          }
          if(document.getElementById("background") != null){
            (<HTMLElement>document.getElementById("background")).style.backgroundColor = "red";
          }
          if(rep == 0) this.checkRules(1);
          return;
        }
      }
      if(document.getElementById("info") != null){
         (<HTMLElement>document.getElementById("info")).innerText = "Die Felder sind richtig erstellt";
         MenuHelper.patientenaufkommen = true;
      }
      if(document.getElementById("background") != null){
        (<HTMLElement>document.getElementById("background")).style.backgroundColor = "green";
      }
  }
}
