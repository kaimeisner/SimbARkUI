import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import { MenuHelper } from './../menu/MenuHelper';
import {CookieService} from 'ngx-cookie-service'

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})

@Injectable({providedIn: 'root'})
export class SelectComponent {
  private templates: any;
  constructor(private http: HttpClient, private cookie:CookieService){
  }

  ngOnInit(){
    MenuHelper.setMenu(document, [""]);
    MenuHelper.setTemplateZonen(true);
    MenuHelper.setZonenAufbau(false);
    MenuHelper.setPatientenaufkommen(false);
    this.getTemplates();
  }

  /*
    Ladet die Namen aller Templates aus der Datenbank
  */
  private getTemplates(){
      this.http.get<Array<String>>('http://localhost:8080/getTemplates')
          .toPromise()
          .then(data =>{this.templates = data;
            for(let i = 0; i < this.templates.length;i++){
                  this.addOptionToSelect(this.templates[i]);
                }})
          .catch(err => {console.log('error')})
  }

  /*
    Fügt ein TemplateNamen zu den Optionen hinzu
  */
  private addOptionToSelect(option: string) {
    const select = document.querySelector('#select');
    if(select != null){
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.text = option;
        select.appendChild(optionElement);
    }
  }

  /*
    Erzeugt ein neues Template, sofern noch kein Template mit dem selben Namen existiert
  */
  public addTemplate(){
    let name = "";
    name = (<HTMLInputElement>document.getElementById('name')).value;
    if(name == "") {
      alert("Es wurde kein Name eingegeben");
      return;
    }
    this.http.get('http://localhost:8080/addTemplate?name='+name+"&height="+100+"&width="+100).subscribe(data =>{let added = data;
            if(!added){
              alert("Dieses Templates existiert bereist");
              return;
            }
            this.cookie.set("template", name);
            window.open("/areas", "_self");
    });
  }

  /*
    öffnet das gewählte Template
  */
  public loadTemplate(){
      let template = (<HTMLSelectElement>document.getElementById('select')).value;
      this.cookie.set("template", template);
      window.open("/areas", "_self");
  }
}
