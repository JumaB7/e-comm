import { Directive } from '@angular/core';

@Directive()
export class AdminShellBaseDirective {
  readonly links = [
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Products', path: '/admin/products' },
    { label: 'Sales', path: '/admin/sales' },
    { label: 'Stock', path: '/admin/stock' },
  ];
}
