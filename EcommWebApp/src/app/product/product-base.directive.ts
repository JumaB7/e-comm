import { Directive, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class ProductBaseDirective {
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  readonly sku = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('sku') ?? '')), {
    initialValue: '',
  });
  readonly product = computed(() => this.catalog.find(this.sku()));
  readonly related = computed(() => this.catalog.products().filter((product) => product.sku !== this.sku()).slice(0, 3));
  readonly quantity = signal(1);

  decrease(): void {
    this.quantity.update((value) => Math.max(1, value - 1));
  }

  increase(): void {
    this.quantity.update((value) => value + 1);
  }

  addToBag(): void {
    const product = this.product();
    if (!product) {
      return;
    }
    this.cart.add(product, this.quantity());
  }
}
