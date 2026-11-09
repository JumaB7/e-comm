import { Directive, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { StockAvailabilityService } from '../services/stock-availability.service';
import { ToastService } from '../services/toast.service';

@Directive()
export class ProductBaseDirective {
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly stockAvailability = inject(StockAvailabilityService);
  readonly sku = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('sku') ?? '')), {
    initialValue: '',
  });
  readonly ready = this.catalog.ready;
  readonly product = computed(() => this.catalog.find(this.sku()));
  readonly related = computed(() => this.catalog.products().filter((product) => product.sku !== this.sku()).slice(0, 3));
  readonly quantity = signal(1);
  readonly remaining = computed(() => {
    const product = this.product();
    return product ? this.cart.remainingStock(product) : 0;
  });
  readonly outOfStock = computed(() => {
    const product = this.product();
    return !!product && this.stockAvailability.isOutOfStock(product.stock);
  });
  readonly stockHint = computed(() => {
    const product = this.product();
    return product ? this.stockAvailability.lowStockHint(product.stock) : '';
  });
  readonly metaLine = computed(() => {
    const product = this.product();
    return product ? this.stockAvailability.metaLine(product.sku, product.stock) : '';
  });
  readonly addLabel = computed(() => (this.outOfStock() ? 'Out of stock' : 'Add to bag'));

  decrease(): void {
    this.quantity.update((value) => Math.max(1, value - 1));
  }

  increase(): void {
    const max = this.remaining();
    if (max < 1) {
      return;
    }
    this.quantity.update((value) => Math.min(value + 1, max));
  }

  addToBag(): void {
    const product = this.product();
    if (!product || this.outOfStock()) {
      return;
    }
    const requested = this.quantity();
    const added = this.cart.add(product, requested);
    if (added < 1) {
      this.toast.show(
        product.stock < 1 ? `${product.name} is out of stock.` : `Only ${product.stock} of ${product.name} in stock.`,
      );
      return;
    }
    if (added < requested) {
      this.toast.show(`Only ${added} added — ${product.stock} of ${product.name} in stock.`);
    } else {
      this.toast.show(`${added} × ${product.name} added to your bag.`);
    }
    this.quantity.set(1);
  }
}
