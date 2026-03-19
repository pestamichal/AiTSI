import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { environment } from '@environments/environments';
import { SocialUser, SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private socialAuthService: SocialAuthService,
  ) {}

  public ngOnInit(): void {
    this.initGoogleAuthLayer();
  }
  private initGoogleAuthLayer(): void {
    const storedUser: string | null = localStorage.getItem(environment.storage_user_node);

    if (storedUser) {
      this.authService.googleUserAccount.next(JSON.parse(storedUser));
      this.authService.isLoggedIn.next(true);
    }

    this.socialAuthService.authState.subscribe((user: SocialUser): void => {

      if(user) {
        this.authService.googleUserAccount.next(user);
        this.authService.isLoggedIn.next(true);
        localStorage.setItem(environment.storage_user_node, JSON.stringify(user));
        return;
      }

      this.authService.googleUserAccount.next(undefined);
      this.authService.isLoggedIn.next(false);
      localStorage.removeItem(environment.storage_user_node);
    });
  }
}
