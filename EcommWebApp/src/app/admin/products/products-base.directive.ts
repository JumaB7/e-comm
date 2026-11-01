import { Directive, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { categorySpecFields, productCategories } from '../../models/constants';
import { Product, ProductSpec } from '../../models/product.model';
import { apiMessage } from '../../services/api-message';
import { CatalogService } from '../../services/catalog.service';
import { SkuService } from '../../services/sku.service';

@Directive()
export class AdminProductsBaseDirective {
  private readonly catalog = inject(CatalogService);
  private readonly skus = inject(SkuService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private suspendPrefix = false;
  readonly products = this.catalog.products;
  readonly categories = productCategories;
  readonly adding = signal(false);
  readonly submitted = signal(false);
  readonly category = signal('Optics');
  readonly skuPrefix = signal(this.skus.prefix('Optics'));
  readonly editingSku = signal('');
  readonly menuSku = signal('');
  readonly saveError = signal('');
  readonly imageFile = signal<File | null>(null);
  readonly imagePreview = signal('');
  readonly imageError = signal('');
  private readonly editSku = signal('');
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sku: new FormControl(this.skus.prefix('Optics'), { nonNullable: true, validators: [Validators.required, (control) => this.skus.completeSku(control)] }),
    originalSku: new FormControl('', { nonNullable: true }),
    category: new FormControl('Optics', { nonNullable: true, validators: [Validators.required] }),
    price: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)] }),
    stock: new FormControl('1', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d+$/)] }),
    magnification: new FormControl('', { nonNullable: true }),
    weight: new FormControl('', { nonNullable: true }),
    waterproof: new FormControl(false, { nonNullable: true }),
    size: new FormControl('', { nonNullable: true }),
    blade: new FormControl('', { nonNullable: true }),
    volume: new FormControl('', { nonNullable: true }),
    power: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.form.controls.category.valueChanges.pipe(takeUntilDestroyed()).subscribe((category) => {
      this.category.set(category);
      if (!this.suspendPrefix) {
        this.applyPrefix(category);
      }
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.editSku.set(params.get('edit') ?? '');
    });
    effect(() => {
      const sku = this.editSku();
      const product = this.products().find((item) => item.sku === sku);
      if (!sku || !product || this.editingSku() === sku) {
        return;
      }
      untracked(() => this.fill(product));
    });
  }

  toggleAdd(): void {
    this.adding.update((open) => !open);
    this.submitted.set(false);
    this.saveError.set('');
    this.menuSku.set('');
    if (!this.adding()) {
      this.editingSku.set('');
      this.clearEditQuery();
      this.clearImage();
      return;
    }
    this.resetBlank();
  }

  onImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.imageError.set('');
    if (!file) {
      this.clearImage();
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.imageError.set('Use a JPG, PNG, or WebP image.');
      input.value = '';
      return;
    }
    if (file.size > 2_500_000) {
      this.imageError.set('Keep the image under 2.5 MB.');
      input.value = '';
      return;
    }
    this.revokePreview();
    this.imageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
  }

  editProduct(product: Product): void {
    this.menuSku.set('');
    this.editSku.set(product.sku);
    this.fill(product);
    void this.router.navigate([], { queryParams: { edit: product.sku }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  deleteProduct(sku: string): void {
    this.catalog.removeProduct(sku);
    this.menuSku.set('');
    if (this.editingSku() === sku) {
      this.adding.set(false);
      this.editingSku.set('');
      this.clearEditQuery();
    }
  }

  toggleMenu(sku: string): void {
    this.menuSku.update((open) => (open === sku ? '' : sku));
  }

  closeMenu(): void {
    this.menuSku.set('');
  }

  saveProduct(): void {
    this.submitted.set(true);
    this.saveError.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    const payload = {
      name: value.name.trim(),
      sku: value.sku.trim(),
      category: value.category,
      priceRands: Number(value.price),
      stock: Number(value.stock),
      specs: this.specs(value),
    };
    const editing = this.editingSku();
    const request = editing ? this.catalog.updateProduct(editing, payload) : this.catalog.addProduct(payload);
    request.pipe(
      switchMap((saved) => {
        const file = this.imageFile();
        return file ? this.catalog.uploadProductImage(saved.sku, file) : of(saved);
      }),
      catchError((error: HttpErrorResponse) => {
        this.saveError.set(apiMessage(error));
        return of(undefined);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((saved) => {
      if (!saved) {
        return;
      }
      this.finish();
    });
  }

  private fill(product: Product): void {
    const category = this.categories.includes(product.category) ? product.category : 'Camp';
    this.editingSku.set(product.sku);
    this.adding.set(true);
    this.submitted.set(false);
    this.saveError.set('');
    this.clearImage();
    this.imagePreview.set(product.image || `/api/product-images/${product.sku}.jpg`);
    this.suspendPrefix = true;
    this.form.reset({
      name: product.name,
      sku: product.sku,
      originalSku: product.sku,
      category,
      price: String(product.amount),
      stock: String(product.stock),
      ...this.specControls(product.specs),
    });
    this.category.set(category);
    this.skuPrefix.set(this.skus.prefix(category));
    this.suspendPrefix = false;
  }

  private finish(): void {
    this.adding.set(false);
    this.submitted.set(false);
    this.editingSku.set('');
    this.saveError.set('');
    this.clearEditQuery();
    this.resetBlank();
  }

  private resetBlank(): void {
    this.clearImage();
    this.suspendPrefix = true;
    this.form.reset({
      name: '',
      sku: this.skus.prefix('Optics'),
      originalSku: '',
      category: 'Optics',
      price: '',
      stock: '1',
      magnification: '',
      weight: '',
      waterproof: false,
      size: '',
      blade: '',
      volume: '',
      power: '',
    });
    this.category.set('Optics');
    this.skuPrefix.set(this.skus.prefix('Optics'));
    this.suspendPrefix = false;
  }

  private clearImage(): void {
    this.revokePreview();
    this.imageFile.set(null);
    this.imagePreview.set('');
    this.imageError.set('');
  }

  private revokePreview(): void {
    const preview = this.imagePreview();
    if (preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  }

  private clearEditQuery(): void {
    this.editSku.set('');
    void this.router.navigate([], { queryParams: { edit: null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  private applyPrefix(category: string): void {
    const prefix = this.skus.prefix(category);
    this.skuPrefix.set(prefix);
    const current = this.form.controls.sku.value;
    const previous = this.skus.prefixes().find((item) => current.startsWith(item));
    const rest = previous ? current.slice(previous.length) : current.replace(/^VS-[A-Za-z0-9]+-/, '');
    this.form.controls.sku.setValue(prefix + rest);
  }

  private specs(value: ReturnType<AdminProductsBaseDirective['form']['getRawValue']>): ProductSpec[] {
    return (categorySpecFields[value.category] ?? []).flatMap((field) => {
      if (field.key === 'waterproof') {
        return value.waterproof ? [{ label: field.label, value: 'Yes' }] : [];
      }
      const text = value[field.key].trim();
      return text ? [{ label: field.label, value: text }] : [];
    });
  }

  private specControls(specs: ProductSpec[]) {
    const stored = new Map(specs.map((item) => [item.label, item.value]));
    const controls = {
      magnification: '',
      weight: '',
      waterproof: false,
      size: '',
      blade: '',
      volume: '',
      power: '',
    };
    for (const field of Object.values(categorySpecFields).flat()) {
      const text = stored.get(field.label) ?? '';
      if (field.key === 'waterproof') {
        controls.waterproof = text === 'Yes';
      } else {
        controls[field.key] = text;
      }
    }
    return controls;
  }
}
