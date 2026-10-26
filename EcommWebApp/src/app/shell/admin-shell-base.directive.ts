import { Directive, inject } from '@angular/core';
import { CatalogService } from '../services/catalog.service';
import { AuthService } from '../services/auth.service';

@Directive()
export class AdminShellBaseDirective {
  private readonly auth = inject(AuthService);
  readonly links = [
    { label: 'Orders', path: '/admin/orders', exact: false },
    { label: 'Products', path: '/admin/products', exact: true },
    { label: 'Sales', path: '/admin/sales', exact: true },
    { label: 'Stock', path: '/admin/stock', exact: true },
  ];

  constructor() {
    inject(CatalogService).loadAdmin();
  }

  signOut(): void {
    this.auth.signOut();
  }
}
