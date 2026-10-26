import { Directive, inject } from '@angular/core';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class OrdersBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly orders = this.catalog.orders;
  readonly stats = [
    { label: 'Today', value: '6 orders' },
    { label: 'Paid today', value: 'R 42 180' },
    { label: 'Awaiting payment', value: '2' },
    { label: 'Low stock', value: '3 products' },
  ];
  readonly mobileStats = [
    { label: 'Today', value: '6' },
    { label: 'Paid', value: 'R 42k' },
    { label: 'Waiting', value: '2' },
  ];
}
