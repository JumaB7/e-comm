import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { readAuthClaims } from './jwt-claims';
import { SessionStoreService } from './session-store.service';

export const authGuard: CanActivateFn = (_route, state) => {
  if (readAuthClaims(inject(SessionStoreService).getToken())) {
    return true;
  }
  return inject(Router).createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
};
