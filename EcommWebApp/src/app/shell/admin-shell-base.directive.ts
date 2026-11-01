import { Directive, inject } from '@angular/core';
import { adminLinks } from '../models/constants';
import { CatalogService } from '../services/catalog.service';
import { AuthService } from '../services/auth.service';

@Directive()
export class AdminShellBaseDirective {
  private readonly auth = inject(AuthService);
  readonly links = adminLinks;

  constructor() {
    inject(CatalogService).loadAdmin();
  }

  signOut(): void {
    this.auth.signOut();
  }
}
