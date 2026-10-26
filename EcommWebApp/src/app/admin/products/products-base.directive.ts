import { Directive, inject, signal } from '@angular/core';
import { CatalogService } from '../../services/catalog.service';
import { Product } from '../../models/product.model';

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
    const amount = Number(this.draftPrice().replace(/[^\d]/g, ''));
    const stock = Number(this.draftStock());
    const name = this.draftName().trim();
    const sku = this.draftSku().trim();
    if (!name || !sku || !Number.isFinite(amount) || amount < 1 || !Number.isFinite(stock)) {
      return;
    }
    const product: Product = {
      sku,
      name,
      category: this.draftCategory().trim() || 'Camp',
      price: `R ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
      amount,
      stock,
      low: stock <= 4,
      blurb: `${name}. Sold on its own.`,
      specs: [{ label: 'Delivery', value: 'Courier, 2–5 working days' }],
    };
    this.catalog.addProduct(product);
    this.adding.set(false);
    this.draftName.set('');
    this.draftSku.set('');
    this.draftPrice.set('');
    this.draftStock.set('1');
  }
}
