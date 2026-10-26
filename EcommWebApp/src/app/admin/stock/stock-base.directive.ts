import { Directive, computed, inject, signal } from '@angular/core';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class StockBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly products = this.catalog.products;
  readonly stockName = signal('10×42 binoculars');
  readonly stockQty = signal('6');
  readonly pendingSku = signal('VS-KNF-018');
  readonly pending = computed(() => this.products().find((product) => product.sku === this.pendingSku()));
  readonly pendingTitle = computed(() => {
    const product = this.pending();
    return product ? `Delete ${product.name.toLowerCase()}?` : '';
  });

  setName(event: Event): void {
    this.stockName.set((event.target as HTMLInputElement).value);
  }

  setQty(event: Event): void {
    this.stockQty.set((event.target as HTMLInputElement).value);
  }

  addStock(): void {
    this.catalog.adjustStock(this.stockName(), Number(this.stockQty()), 1);
  }

  removeStock(): void {
    this.catalog.adjustStock(this.stockName(), Number(this.stockQty()), -1);
  }

  choose(sku: string): void {
    this.pendingSku.set(sku);
  }

  keep(): void {
    this.pendingSku.set('');
  }

  deleteProduct(): void {
    const product = this.pending();
    if (!product) {
      return;
    }
    this.catalog.removeProduct(product.sku);
    this.pendingSku.set('');
  }
}
