import { Directive, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { Product } from '../../models/product.model';
import { apiMessage } from '../../services/api-message';
import { CatalogService } from '../../services/catalog.service';

const skuPrefixes: Record<string, string> = {
  Optics: 'VS-OPT-',
  Apparel: 'VS-APP-',
  Knives: 'VS-KNF-',
  Packs: 'VS-PCK-',
  Camp: 'VS-CMP-',
};

function completeSku(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  const original = String(control.parent?.get('originalSku')?.value ?? '').trim();
  if (original && value === original) {
    return null;
  }
  const category = String(control.parent?.get('category')?.value ?? 'Optics');
  const prefix = skuPrefixes[category] ?? skuPrefixes['Optics'];
  if (!value.startsWith(prefix)) {
    return { prefix: true };
  }
  return value.length > prefix.length && !value.endsWith('-') ? null : { sku: true };
}

@Directive()
export class AdminProductsBaseDirective {
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private suspendPrefix = false;
  readonly products = this.catalog.products;
  readonly categories = ['Optics', 'Apparel', 'Knives', 'Packs', 'Camp'];
  readonly adding = signal(false);
  readonly submitted = signal(false);
  readonly category = signal('Optics');
  readonly skuPrefix = signal(skuPrefixes['Optics']);
  readonly editingSku = signal('');
  readonly menuSku = signal('');
  readonly saveError = signal('');
  readonly imageFile = signal<File | null>(null);
  readonly imagePreview = signal('');
  readonly imageError = signal('');
  private readonly editSku = signal('');
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sku: new FormControl(skuPrefixes['Optics'], { nonNullable: true, validators: [Validators.required, completeSku] }),
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
    const spec = (label: string) => product.specs.find((item) => item.label === label)?.value ?? '';
    const category = this.categories.includes(product.category) ? product.category : 'Camp';
    this.editingSku.set(product.sku);
    this.adding.set(true);
    this.submitted.set(false);
    this.saveError.set('');
    this.clearImage();
    this.imagePreview.set(product.image || `/products/${product.sku}.jpg`);
    this.suspendPrefix = true;
    this.form.reset({
      name: product.name,
      sku: product.sku,
      originalSku: product.sku,
      category,
      price: String(product.amount),
      stock: String(product.stock),
      magnification: spec('Magnification'),
      weight: spec('Weight'),
      waterproof: spec('Waterproof') === 'Yes',
      size: spec('Size'),
      blade: spec('Blade'),
      volume: spec('Volume'),
      power: spec('Power'),
    });
    this.category.set(category);
    this.skuPrefix.set(skuPrefixes[category] ?? skuPrefixes['Optics']);
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
      sku: skuPrefixes['Optics'],
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
    this.skuPrefix.set(skuPrefixes['Optics']);
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
    const prefix = skuPrefixes[category] ?? skuPrefixes['Optics'];
    this.skuPrefix.set(prefix);
    const current = this.form.controls.sku.value;
    const previous = Object.values(skuPrefixes).find((item) => current.startsWith(item));
    const rest = previous ? current.slice(previous.length) : current.replace(/^VS-[A-Za-z0-9]+-/, '');
    this.form.controls.sku.setValue(prefix + rest);
  }

  private specs(value: ReturnType<AdminProductsBaseDirective['form']['getRawValue']>): { label: string; value: string }[] {
    const rows: { label: string; value: string }[] = [];
    const add = (label: string, text: string) => {
      const trimmed = text.trim();
      if (trimmed) {
        rows.push({ label, value: trimmed });
      }
    };
    if (value.category === 'Optics') {
      add('Magnification', value.magnification);
      add('Weight', value.weight);
      if (value.waterproof) {
        rows.push({ label: 'Waterproof', value: 'Yes' });
      }
    } else if (value.category === 'Apparel') {
      add('Size', value.size);
    } else if (value.category === 'Knives') {
      add('Blade', value.blade);
    } else if (value.category === 'Packs') {
      add('Volume', value.volume);
    } else if (value.category === 'Camp') {
      add('Power', value.power);
    }
    return rows;
  }
}
