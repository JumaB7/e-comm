import { Directive, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { shopFilters } from '../models/constants';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class ShopPageBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly filters = shopFilters;
  readonly category = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('category') ?? '')),
    { initialValue: '' },
  );
  readonly visible = computed(() => {
    const category = this.category();
    const query = this.catalog.search().trim().toLowerCase();
    return this.catalog.products().filter((product) => {
      const categoryMatches = !category || product.category === category;
      const queryMatches =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      return categoryMatches && queryMatches;
    });
  });
  readonly countLabel = computed(() => `${this.visible().length} products`);
}
