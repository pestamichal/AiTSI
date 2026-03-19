import { Injectable } from '@angular/core';
import {SocialUser} from '@abacritt/angularx-social-login';
import {BehaviorSubject, map, Observable, of, switchMap} from 'rxjs';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '@environments/environments';


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

  public logout(): void {
    this.isLoggedIn.next(false);
    localStorage.removeItem(environment.storage_user_node);
    this.googleUserAccount.next(undefined);
  }

}
