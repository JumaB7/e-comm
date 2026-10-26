import { Directive, computed, inject } from '@angular/core';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class HomeBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly featured = this.catalog.featured;
  readonly feature = computed(() => this.featured()[0]);
  readonly categories = [
    { name: 'Optics', detail: 'Glass and lights', short: 'Glass' },
    { name: 'Apparel', detail: 'Stalking layers', short: 'Layers' },
    { name: 'Knives', detail: 'Field tools', short: 'Tools' },
    { name: 'Camp', detail: 'Blinds and packs', short: 'Blinds' },
  ];
}
