import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export const adminGuard: CanActivateFn = (_route, state) => {
  if (adminToken(sessionStorage.getItem('veld-token'))) {
    return true;
  }
  return inject(Router).createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
};

function adminToken(token: string | null): boolean {
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
    const claims = JSON.parse(atob(padded)) as {
      exp?: number;
      role?: string;
      [roleClaim]?: string;
    };
    if (typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now()) {
      return false;
    }
    return (claims.role ?? claims[roleClaim]) === 'Admin';
  } catch {
    return false;
  }
}
