import { Directive, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';
import { Product } from '../../models/product.model';

interface StockRow {
  shown: number;
  editing: boolean;
  menuOpen: boolean;
  canDecrease: boolean;
  busy: boolean;
  invalid: boolean;
}

@Directive()
export class StockBaseDirective {
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  readonly products = this.catalog.products;
  readonly editingSku = signal('');
  readonly menuSku = signal('');
  readonly draft = signal('');
  private readonly editError = signal(false);
  private readonly pendingCount = signal<Record<string, number>>({});
  private readonly savingSkus = signal<ReadonlySet<string>>(new Set());
  private ignoreCommit = false;
  private committedSku = '';
  readonly rowView = computed(() => {
    const editing = this.editingSku();
    const menu = this.menuSku();
    const draft = this.draft().trim();
    const pending = this.pendingCount();
    const saving = this.savingSkus();
    const showError = this.editError();
    const rows: Record<string, StockRow> = {};
    for (const product of this.products()) {
      const isEditing = editing === product.sku;
      const parsed = /^\d+$/.test(draft) ? Number(draft) : null;
      const shown = isEditing && parsed !== null ? parsed : (pending[product.sku] ?? product.stock);
      const busy = saving.has(product.sku);
      rows[product.sku] = {
        shown,
        editing: isEditing,
        menuOpen: menu === product.sku,
        canDecrease: shown > 0 && !busy,
        busy,
        invalid: isEditing && showError,
      };
    }
    return rows;
  });

  startEdit(product: Product): void {
    if (this.savingSkus().has(product.sku)) {
      return;
    }
    this.menuSku.set('');
    this.editError.set(false);
    this.draft.set(String(this.pendingCount()[product.sku] ?? product.stock));
    this.editingSku.set(product.sku);
  }

  setDraft(value: string): void {
    this.draft.set(value);
    this.editError.set(false);
  }

  holdStep(event: MouseEvent): void {
    event.preventDefault();
    this.ignoreCommit = true;
    queueMicrotask(() => {
      this.ignoreCommit = false;
    });
  }

  step(product: Product, direction: 1 | -1): void {
    if (this.committedSku === product.sku) {
      this.committedSku = '';
      return;
    }
    if (this.savingSkus().has(product.sku)) {
      return;
    }
    const base = this.baseCount(product);
    if (base === null) {
      this.editError.set(true);
      return;
    }
    const next = base + direction;
    if (next < 0) {
      return;
    }
    this.editingSku.set('');
    this.editError.set(false);
    this.save(product, next);
  }

  commit(product: Product): void {
    if (this.ignoreCommit || this.editingSku() !== product.sku) {
      return;
    }
    const raw = this.draft().trim();
    if (!/^\d+$/.test(raw)) {
      this.editError.set(true);
      return;
    }
    this.editingSku.set('');
    this.editError.set(false);
    this.committedSku = product.sku;
    queueMicrotask(() => {
      if (this.committedSku === product.sku) {
        this.committedSku = '';
      }
    });
    this.save(product, Number(raw));
  }

  cancelEdit(): void {
    this.editingSku.set('');
    this.editError.set(false);
  }

  toggleMenu(sku: string): void {
    this.menuSku.update((open) => (open === sku ? '' : sku));
  }

  closeMenu(): void {
    this.menuSku.set('');
  }

  editProduct(sku: string): void {
    this.menuSku.set('');
    void this.router.navigate(['/admin/products'], { queryParams: { edit: sku } });
  }

  deleteProduct(sku: string): void {
    this.catalog.removeProduct(sku);
    this.menuSku.set('');
    if (this.editingSku() === sku) {
      this.cancelEdit();
    }
  }

  private baseCount(product: Product): number | null {
    if (this.editingSku() !== product.sku) {
      return this.pendingCount()[product.sku] ?? product.stock;
    }
    const raw = this.draft().trim();
    return /^\d+$/.test(raw) ? Number(raw) : null;
  }

  private save(product: Product, next: number): void {
    const current = product.stock;
    if (next === current || this.savingSkus().has(product.sku)) {
      return;
    }
    const delta = next - current;
    this.pendingCount.update((counts) => ({ ...counts, [product.sku]: next }));
    this.savingSkus.update((skus) => new Set(skus).add(product.sku));
    this.catalog.adjustStock(product.name, Math.abs(delta), delta > 0 ? 1 : -1).add(() => {
      this.savingSkus.update((skus) => {
        const nextSkus = new Set(skus);
        nextSkus.delete(product.sku);
        return nextSkus;
      });
      this.pendingCount.update((counts) => {
        const nextCounts = { ...counts };
        delete nextCounts[product.sku];
        return nextCounts;
      });
    });
  }
}
