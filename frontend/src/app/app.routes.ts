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
  },
  {
    path: 'edit-photo/:id',
    pathMatch: 'full',
    loadComponent: () => import('./pages/edit-photo/edit-photo').then(m => m.EditPhoto),
    canActivate: [loggedInGuard],
  },
  {
    path: 'my-photos',
    loadComponent: () => import('./pages/my-photos/my-photos').then(m => m.MyPhotos),
    canActivate: [loggedInGuard],
  },
  {
    path:"**",
    redirectTo: 'feed'
  }
];
