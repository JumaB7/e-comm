import { Directive, computed, inject } from '@angular/core';
import { homeCategories } from '../models/constants';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class HomeBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly featured = this.catalog.featured;
  readonly feature = computed(() => this.featured()[0]);
  readonly categories = homeCategories;
}
