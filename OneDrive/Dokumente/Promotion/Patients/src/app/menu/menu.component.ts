import { Component } from '@angular/core';
import {CookieService} from 'ngx-cookie-service'
import { MenuHelper } from './../menu/MenuHelper';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

export class MenuComponent {
  constructor (private cookie:CookieService){}

  //Öffnet die entsprechenden Seiten


  public select(){
    if(MenuHelper.templateZonen)  window.open("/select", "_self");
  }

  public areas(){
    if(MenuHelper.zonenAufbau)  window.open("/areas", "_self");
  }

  public patientenaufkommenmenu(){
    if(MenuHelper.patientenaufkommen)  window.open("/patientenaufkommenkoordination", "_self");
  }
}
