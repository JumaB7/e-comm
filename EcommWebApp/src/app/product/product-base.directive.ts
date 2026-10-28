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
  readonly ready = this.catalog.ready;
  readonly product = computed(() => this.catalog.find(this.sku()));
  readonly related = computed(() => this.catalog.products().filter((product) => product.sku !== this.sku()).slice(0, 3));
  readonly quantity = signal(1);
  private readonly addedSku = signal('');
  private readonly addedQty = signal(0);
  readonly addedNotice = computed(() => {
    const item = this.product();
    const qty = this.addedQty();
    if (!item || qty < 1 || this.addedSku() !== item.sku) {
      return '';
    }
    return `${qty} × ${item.name} added to your bag.`;
  });

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
    const qty = this.quantity();
    this.cart.add(product, qty);
    this.addedSku.set(product.sku);
    this.addedQty.set(qty);
  }
}
