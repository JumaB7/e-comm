import { Directive, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class AdminProductsBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly products = this.catalog.products;
  readonly adding = signal(false);
  readonly submitted = signal(false);
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sku: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl('Camp', { nonNullable: true }),
    price: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)] }),
    stock: new FormControl('1', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d+$/)] }),
  });

  toggleAdd(): void {
    this.adding.update((open) => !open);
    this.submitted.set(false);
  }

  saveProduct(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.catalog.addProduct({
      name: value.name.trim(),
      sku: value.sku.trim(),
      category: value.category.trim() || 'Camp',
      priceRands: Number(value.price),
      stock: Number(value.stock),
    });
    this.adding.set(false);
    this.submitted.set(false);
    this.form.reset({ name: '', sku: '', category: 'Camp', price: '', stock: '1' });
  }
}
