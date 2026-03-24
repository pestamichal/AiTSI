import { Routes } from '@angular/router';
import { loggedInGuard } from './guards/loggedIn.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'not-authorized', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'feed', 
    loadComponent: () => import('./pages/feed/feed.component').then(m => m.FeedComponent),
  },
  { 
    path: 'create-photo', 
    loadComponent: () => import('./pages/create-photo/create-photo').then(m => m.CreatePhoto),
    canActivate: [loggedInGuard]
  }
];
