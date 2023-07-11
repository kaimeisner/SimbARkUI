import { Component } from '@angular/core';
import {MenuHelper} from './../menu/MenuHelper';
import {Area} from './../areas/Area';
import {CookieService} from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-patientenaufkommen',
  templateUrl: './patientenaufkommen.component.html',
  styleUrls: ['./patientenaufkommen.component.css']
})
export class PatientenaufkommenComponent {
  constructor(private http: HttpClient, private cookie:CookieService){}

  areas:Array<Area> = [];
  response:any;
  template:String = "";

  ngOnInit(){
      MenuHelper.setMenu(document, ["Zonen", "TemplateZonen", "ZonenAufbau"]);
      MenuHelper.setTemplateZonen(true);
      MenuHelper.setZonenAufbau(true);
      MenuHelper.setPatientenaufkommen(true);
      this.loadTemplate()
  }

   private loadTemplate(){
      this.template = this.cookie.get("template");
      let ids = this.cookie.get("marked").split(",");

      this.http.get('http://localhost:8080/getTemplate?template='+this.template).subscribe(data =>{
          let arr = <Array<Area>>data;
          for(let i = 0; i < arr.length; i++){
            if(ids.includes(""+arr[i].id)){
                let area = new Area(arr[i].x1, arr[i].x2, arr[i].y1, arr[i].y2, arr[i].template, arr[i].name, arr[i].soldiers, arr[i].patientenaufkommen);
                area.id = arr[i].id;
                this.areas.push(area);
            }
          }
      });
   }

    public save(){
      for(let i = 0; i < this.areas.length; i++){
         if(document.getElementById("aufkommen") != null){
              let aufkommen = 0;
              aufkommen  = +(<HTMLInputElement>document.getElementById("aufkommen")).value;
              this.areas[i].patientenaufkommen = aufkommen;
              this.saves(this.areas[i]);
          }
      }
      window.open("/patientenaufkommenkoordination", "_self")
    }

    private saves(area: Area){
      this.http.get('http://localhost:8080/add?id='+area.id+'&x1='+area.x1+'&x2='+area.x2+'&y1='+area.y1+'&y2='+area.y2+'&template='+this.template+'&name='+area.name+'&soldiers='+area.soldiers+'&patientenaufkommen='+area.patientenaufkommen).subscribe(data =>{this.response = data;
            });
        return area;
    }
}
