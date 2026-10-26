import { Directive, inject } from '@angular/core';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class ShopPageBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly products = this.catalog.products;
}
