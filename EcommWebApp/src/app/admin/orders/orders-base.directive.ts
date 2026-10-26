import { Directive, inject } from '@angular/core';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class OrdersBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly orders = this.catalog.orders;
}
