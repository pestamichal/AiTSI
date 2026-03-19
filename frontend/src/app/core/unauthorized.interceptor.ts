import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '@services';

export const unauthorizedInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router: Router = inject(Router);
  const authService: AuthService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();

        void router.navigate(['/not-authorized']);
      }
      return throwError(() => error);
    })
  );
};
