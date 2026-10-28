import { Directive, inject } from '@angular/core';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class AccountOrdersBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly orders = this.catalog.myOrders;
  readonly ready = this.catalog.myOrdersReady;

  constructor() {
    this.catalog.loadMyOrders();
  }
}
