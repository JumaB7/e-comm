import { HttpErrorResponse } from '@angular/common/http';

export function apiMessage(error: HttpErrorResponse): string {
  const message = error.error?.message;
  return typeof message === 'string' ? message : 'The shop could not reach the server.';
}
