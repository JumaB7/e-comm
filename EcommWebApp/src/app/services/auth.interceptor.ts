import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = sessionStorage.getItem('veld-token');
  if (!token) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

export function apiMessage(error: HttpErrorResponse): string {
  const message = error.error?.message;
  return typeof message === 'string' ? message : 'The shop could not reach the server.';
}
