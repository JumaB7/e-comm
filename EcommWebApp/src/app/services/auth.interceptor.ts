import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = sessionStorage.getItem('veld-token');
  const router = inject(Router);
  const auth = inject(AuthService);
  const authForm =
    request.url.includes('/api/auth/sign-in') ||
    request.url.includes('/api/auth/register') ||
    request.url.includes('/api/auth/forgot-password') ||
    request.url.includes('/api/auth/reset-password');
  const authed =
    token && !authForm ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(authed).pipe(
    catchError((error: HttpErrorResponse) => {
      const sentBearer = authed.headers.get('Authorization');
      const currentToken = sessionStorage.getItem('veld-token');
      // Ignore 401s from an older request after sign-in replaced/cleared the token.
      const staleAuthFailure =
        !!sentBearer && (!currentToken || sentBearer !== `Bearer ${currentToken}`);
      if (
        !authForm &&
        !staleAuthFailure &&
        (error.status === 401 || (error.status === 403 && request.url.includes('/api/admin')))
      ) {
        auth.clearSession();
        const returnUrl = router.url.startsWith('/sign-in') ? undefined : router.url;
        void router.navigate(['/sign-in'], { queryParams: returnUrl ? { returnUrl } : {} });
      }
      return throwError(() => error);
    }),
  );
};
