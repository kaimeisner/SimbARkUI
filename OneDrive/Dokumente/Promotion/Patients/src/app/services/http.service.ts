import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  /** Funktionen um mit dem Backend zu kommunizieren (CRUD) */
    getData(url: string): Observable<any> {
      return this.http.get(url);
    }
    
    postData(url: string, body: any) {
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this.http.post(url, body, { headers });
    }
}
