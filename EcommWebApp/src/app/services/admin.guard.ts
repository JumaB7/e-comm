import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { readAuthClaims } from './jwt-claims';
import { SessionStoreService } from './session-store.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const claims = readAuthClaims(inject(SessionStoreService).getToken());
  if (claims?.role === 'Admin') {
    return true;
  }
  return inject(Router).createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
};
