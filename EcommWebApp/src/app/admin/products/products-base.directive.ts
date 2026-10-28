import { Directive, inject, signal } from '@angular/core';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class AdminProductsBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly products = this.catalog.products;
  readonly adding = signal(false);
  readonly draftName = signal('');
  readonly draftSku = signal('');
  readonly draftCategory = signal('Camp');
  readonly draftPrice = signal('');
  readonly draftStock = signal('1');

  toggleAdd(): void {
    this.adding.update((open) => !open);
  }

  setDraft(field: 'name' | 'sku' | 'category' | 'price' | 'stock', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'name') {
      this.draftName.set(value);
    } else if (field === 'sku') {
      this.draftSku.set(value);
    } else if (field === 'category') {
      this.draftCategory.set(value);
    } else if (field === 'price') {
      this.draftPrice.set(value);
    } else {
      this.draftStock.set(value);
    }
  }

  saveProduct(): void {
    const priceRands = Number(this.draftPrice().replace(/[^\d]/g, ''));
    const stock = Number(this.draftStock());
    const name = this.draftName().trim();
    const sku = this.draftSku().trim();
    if (!name || !sku || !Number.isFinite(priceRands) || priceRands < 1 || !Number.isFinite(stock)) {
      return;
    }
    this.catalog.addProduct({
      name,
      sku,
      category: this.draftCategory().trim() || 'Camp',
      priceRands,
      stock,
    });
    this.adding.set(false);
    this.draftName.set('');
    this.draftSku.set('');
    this.draftPrice.set('');
    this.draftStock.set('1');
  }
}
