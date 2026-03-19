import { SocialUser, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, ThemeService, ThemeId } from '@services';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule, NgModel } from '@angular/forms';

const THEME_OPTIONS: { id: ThemeId; label: string }[] = [
  { id: ThemeId.Standard, label: 'Jasny' },
  { id: ThemeId.Dark, label: 'Ciemny' },
  { id: ThemeId.HighContrast, label: 'Wysoki kontrast' },
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    GoogleSigninButtonModule,
    FormsModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  public user: SocialUser | undefined;
  public userName: string = '';
  public userId: string = '';
  public title: string = 'ARCHIWUM';
  public themeOptions = THEME_OPTIONS;
  public currentTheme: ThemeId = ThemeId.Standard;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
  ) {}

  public ngOnInit(): void {
    this.currentTheme = this.themeService.currentTheme;
    this.authService.googleUserAccount
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;
        this.userName = user?.firstName ?? user?.email ?? '';
        this.userId = user?.id ?? '';
      });
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => (this.currentTheme = theme));
  }

  public setTheme(theme: ThemeId): void {
    this.themeService.setTheme(theme);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public logout(): void {
    this.authService.logout();
  }
}