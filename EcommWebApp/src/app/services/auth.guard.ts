import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (_route, state) => {
  if (validToken(sessionStorage.getItem('veld-token'))) {
    return true;
  }
  return inject(Router).createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
};

function validToken(token: string | null): boolean {
  if (!token) {
    return false;
  }
  const payload = token.split('.')[1];
  if (!payload) {
    return false;
  }
  try {
    const encoded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = encoded.padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), '=');
    const claims = JSON.parse(atob(padded)) as { exp?: number };
    return !(typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now());
  } catch {
    return false;
  }
}
