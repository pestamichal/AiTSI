import { Component, OnInit } from '@angular/core';
import {GoogleSigninButtonModule, SocialAuthService, SocialUser} from '@abacritt/angularx-social-login';
import {Router} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '@environments/environments';

@Component({
  selector: 'app-login',
  imports: [
    GoogleSigninButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private socialAuthService: SocialAuthService,
  ) {
  }

  public ngOnInit(): void {
    this.prepareGoogleLogin();
  }

  private prepareGoogleLogin(): void {
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        void this.router.navigate(['/feed']);
      }
    });

    const isTokenStored = localStorage.getItem(environment.storage_user_node);

    if (isTokenStored) {
      this.authService.isLoggedIn.next(true);
      void this.router.navigate(['/feed']);
    }

  }
}
