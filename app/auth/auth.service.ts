import { Injectable, ɵConsole } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/';


@Injectable()
export class AuthService {

  isLoggedIn: boolean = false;
  email: string;
  firstname: string;
  lastname: string;

  constructor(private http: HttpClient) { }

  authentification(login, password): Observable<any> {
    console.log("Dans authentification avec "+login+" "+password);
    let url: string = "https://localhost:8443/auth/login="+login+"/password="+password;
    return this.http.get(url);
  }
}
