import { Directive, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class StockBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly products = this.catalog.products;
  readonly submitted = signal(false);
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    qty: new FormControl('1', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[1-9]\d*$/)] }),
  });
  readonly pendingSku = signal('');
  readonly pending = computed(() => this.products().find((product) => product.sku === this.pendingSku()));
  readonly pendingTitle = computed(() => {
    const product = this.pending();
    return product ? `Delete ${product.name.toLowerCase()}?` : '';
  });

  constructor() {
    effect(() => {
      const name = this.products()[0]?.name ?? '';
      const control = this.form.controls.name;
      if (control.dirty || !name) {
        return;
      }
      control.setValue(name);
      control.markAsPristine();
    });
  }

  addStock(): void {
    this.adjust(1);
  }

  removeStock(): void {
    this.adjust(-1);
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

  private adjust(direction: 1 | -1): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.catalog.adjustStock(this.form.controls.name.value, Number(this.form.controls.qty.value), direction);
  }
}
