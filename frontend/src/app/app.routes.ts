import { Routes } from '@angular/router';
import { loggedInGuard } from './guards/loggedIn.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { 
    path: 'feed', 
    loadComponent: () => import('./pages/feed/feed.component').then(m => m.FeedComponent),
  }
];
