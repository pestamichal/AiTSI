import { Injectable } from '@angular/core';
import {SocialUser} from '@abacritt/angularx-social-login';
import {BehaviorSubject, map, Observable, of, switchMap} from 'rxjs';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '@environments/environments';
import { UserInfo } from '@models';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public googleUserAccount: BehaviorSubject<SocialUser | undefined> = new BehaviorSubject<SocialUser | undefined>(undefined);

  constructor(
    private http: HttpClient,
    private router: Router) {
  }
  
  private readonly apiUrl = `${environment.api_url}/api/auth`;

  public getRequestHeaders(): HttpHeaders{
    return new HttpHeaders({Authorization: `Bearer ${this.googleUserAccount.getValue()?.idToken}`})
  }

  public getUserInfo(): Observable<UserInfo>{
    return this.http.get<UserInfo>(`${this.apiUrl}/me`, {headers: this.getRequestHeaders()});
  }

  public blockUser(email: string): Observable<boolean>{
    return this.http.post<boolean>(`${this.apiUrl}/block`, {email: email}, {headers: this.getRequestHeaders()});
  }

  public logout(): void {
    this.isLoggedIn.next(false);
    localStorage.removeItem(environment.storage_user_node);
    this.googleUserAccount.next(undefined);
  }

}
