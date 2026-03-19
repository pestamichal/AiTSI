import { Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { BehaviorSubject } from 'rxjs';

export enum ThemeId {
  Standard = 'standard',
  Dark = 'dark',
  HighContrast = 'high-contrast',
}

const DEFAULT_THEME = ThemeId.Standard;

const THEME_VALUES: string[] = Object.values(ThemeId);

function isThemeId(value: string): value is ThemeId {
  return THEME_VALUES.includes(value);
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly currentTheme$ = new BehaviorSubject<ThemeId>(this.loadStoredTheme());

  constructor() {
    this.applyTheme(this.currentTheme$.value);
  }

  get currentTheme(): ThemeId {
    return this.currentTheme$.value;
  }

  get theme$() {
    return this.currentTheme$.asObservable();
  }

  setTheme(theme: ThemeId): void {
    if (this.currentTheme$.value === theme) return;
    this.currentTheme$.next(theme);
    this.applyTheme(theme);
    this.persistTheme(theme);
  }

  private loadStoredTheme(): ThemeId {
    if (typeof localStorage === 'undefined') return DEFAULT_THEME;
    const stored = localStorage.getItem(environment.storage_theme_node);
    return stored && isThemeId(stored) ? stored : DEFAULT_THEME;
  }

  private persistTheme(theme: ThemeId): void {
    localStorage.setItem(environment.storage_theme_node, theme);
  }

  private applyTheme(theme: ThemeId): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
