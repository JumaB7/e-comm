import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = sessionStorage.getItem('veld-token');
  const router = inject(Router);
  const auth = inject(AuthService);
  const authed = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(authed).pipe(
    catchError((error: HttpErrorResponse) => {
      const authForm =
        request.url.includes('/api/auth/sign-in') ||
        request.url.includes('/api/auth/register') ||
        request.url.includes('/api/auth/reset-password');
      if (!authForm && (error.status === 401 || (error.status === 403 && request.url.includes('/api/admin')))) {
        auth.clearSession();
        const returnUrl = router.url.startsWith('/sign-in') ? undefined : router.url;
        void router.navigate(['/sign-in'], { queryParams: returnUrl ? { returnUrl } : {} });
      }
      return throwError(() => error);
    }),
  );
};
