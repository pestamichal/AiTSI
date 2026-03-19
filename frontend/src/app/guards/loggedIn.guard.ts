import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '@services';
import {tap} from 'rxjs';

export const loggedInGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.isLoggedIn.asObservable()
    .pipe(
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          void router.navigate(['/login']);
        }
      })
    );
};
