import { Directive, computed, inject } from '@angular/core';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class HomeBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly featured = this.catalog.featured;
  readonly feature = computed(() => this.featured()[0]);
  readonly categories = [
    { name: 'Optics', detail: 'Glass and lights', short: 'Glass', image: '/products/VS-OPT-1042.jpg' },
    { name: 'Apparel', detail: 'Stalking layers', short: 'Layers', image: '/products/VS-APP-220.jpg' },
    { name: 'Knives', detail: 'Field tools', short: 'Tools', image: '/products/VS-KNF-018.jpg' },
    { name: 'Camp', detail: 'Blinds and packs', short: 'Blinds', image: '/products/VS-CMP-014.jpg' },
  ];
}
