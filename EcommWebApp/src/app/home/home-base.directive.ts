import { Directive, inject } from '@angular/core';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class HomeBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly featured = this.catalog.featured;
  readonly categories = ['Optics', 'Apparel', 'Knives', 'Camp'];
}
