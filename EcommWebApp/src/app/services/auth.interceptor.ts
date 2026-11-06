import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthSession } from '../models/auth.model';
import { AuthService } from './auth.service';
import { SessionStoreService } from './session-store.service';

let refreshInFlight$: Observable<AuthSession> | null = null;

function isAuthBootstrap(url: string): boolean {
  return (
    url.includes('/api/auth/sign-in') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/forgot-password') ||
    url.includes('/api/auth/reset-password') ||
    url.includes('/api/auth/refresh') ||
    url.includes('/api/auth/sign-out')
  );
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionStoreService);
  const router = inject(Router);
  const auth = inject(AuthService);
  const http = inject(HttpClient);
  const authForm = isAuthBootstrap(request.url);
  const token = session.getToken();
  const authed =
    token && !authForm ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

  return next(authed).pipe(
    catchError((error: HttpErrorResponse) => {
      const sentBearer = authed.headers.get('Authorization');
      const currentToken = session.getToken();
      // Ignore 401s from an older request after sign-in replaced/cleared the token.
      const staleAuthFailure =
        !!sentBearer && (!currentToken || sentBearer !== `Bearer ${currentToken}`);

      if (error.status === 401 && !authForm && !staleAuthFailure && session.getRefreshToken()) {
        const refreshTokenUsed = session.getRefreshToken()!;
        if (!refreshInFlight$) {
          refreshInFlight$ = http
            .post<AuthSession>('/api/auth/refresh', { refreshToken: refreshTokenUsed })
            .pipe(
              finalize(() => {
                refreshInFlight$ = null;
              }),
              shareReplay({ bufferSize: 1, refCount: false }),
            );
        }

        return refreshInFlight$.pipe(
          switchMap((fresh) => {
            auth.applySession(fresh);
            return next(
              request.clone({ setHeaders: { Authorization: `Bearer ${fresh.token}` } }),
            );
          }),
          catchError((refreshError: HttpErrorResponse) => {
            // Sign-in/register may have replaced the refresh token while this refresh was in flight —
            // do not wipe the new session.
            if (session.getRefreshToken() === refreshTokenUsed) {
              auth.clearSession();
              const returnUrl = router.url.startsWith('/sign-in') ? undefined : router.url;
              void router.navigate(['/sign-in'], { queryParams: returnUrl ? { returnUrl } : {} });
            }
            return throwError(() => refreshError);
          }),
        );
      }

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
