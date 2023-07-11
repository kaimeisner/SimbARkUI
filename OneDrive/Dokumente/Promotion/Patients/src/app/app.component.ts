import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import {CookieService} from 'ngx-cookie-service'
import {MenuHelper} from './menu/MenuHelper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Patientenaufkommen';
    constructor(private http:HttpClient, private cookie:CookieService){
    }

    ngOnInit(){
      MenuHelper.setMenu(document, [""]);
      MenuHelper.setTemplateZonen(true);
      MenuHelper.setZonenAufbau(false);
      MenuHelper.setPatientenaufkommen(false);
    }
}
