import { Directive } from '@angular/core';

@Directive()
export class AdminShellBaseDirective {
  readonly links = [
    { label: 'Orders', path: '/admin/orders', exact: false },
    { label: 'Products', path: '/admin/products', exact: true },
    { label: 'Sales', path: '/admin/sales', exact: true },
    { label: 'Stock', path: '/admin/stock', exact: true },
  ];
}
