import { computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { merge } from 'rxjs';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { ToastService } from '../services/toast.service';
import { CheckoutForm, checkoutForm } from './checkout.form';

const checkoutFieldLabels: Record<keyof CheckoutForm['controls'], string> = {
  email: 'Email',
  phone: 'Phone',
  fullName: 'Full name',
  street: 'Street',
  suburb: 'Suburb',
  city: 'City',
  province: 'Province',
  postalCode: 'Postal code',
};

/** Shared checkout state for desktop/mobile. Plain class so template type-check sees members. */
export class CheckoutBaseDirective {
  private readonly cart = inject(CartService);
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  readonly lines = this.cart.displayLines;
  readonly subtotal = this.cart.subtotalLabel;
  readonly courier = this.cart.courierLabel;
  readonly courierFee = this.cart.courierFeeLabel;
  readonly total = this.cart.totalLabel;
  readonly delivery = this.cart.delivery;
  readonly deliveryChoice = this.cart.deliveryChoice;
  readonly hasLines = this.cart.count;
  readonly hasSavedDelivery = this.cart.hasSavedDelivery;
  readonly submitted = signal(false);
  readonly form: CheckoutForm = checkoutForm();
  private readonly qtyEdits = signal<Record<string, number>>({});
  readonly invalidFields = signal<string[]>([]);
  readonly showValidationSummary = computed(() => this.submitted() && this.invalidFields().length > 0);
  readonly bagRows = computed(() =>
    this.lines().map((line) => ({
      ...line,
      editQty: this.qtyEdits()[line.sku] ?? line.qty,
    })),
  );
  readonly bagDirty = computed(() =>
    this.lines().some((line) => (this.qtyEdits()[line.sku] ?? line.qty) !== line.qty),
  );

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.cart.setContact('email', value.email ?? '');
      this.cart.setContact('phone', value.phone ?? '');
      this.cart.setContact('fullName', value.fullName ?? '');
      this.cart.setContact('street', value.street ?? '');
      this.cart.setContact('suburb', value.suburb ?? '');
      this.cart.setContact('city', value.city ?? '');
      this.cart.setContact('province', value.province ?? '');
      this.cart.setContact('postalCode', value.postalCode ?? '');
    });
    merge(this.form.valueChanges, this.form.statusChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.submitted()) {
          this.refreshInvalidFields();
        }
      });
    effect(() => {
      this.fill(this.form.controls.email, this.cart.email());
      this.fill(this.form.controls.phone, this.cart.phone());
      this.fill(this.form.controls.fullName, this.cart.fullName());
      this.fill(this.form.controls.street, this.cart.street());
      this.fill(this.form.controls.suburb, this.cart.suburb());
      this.fill(this.form.controls.city, this.cart.city());
      this.fill(this.form.controls.province, this.cart.province());
      this.fill(this.form.controls.postalCode, this.cart.postalCode());
    });
    effect(() => {
      const lines = this.cart.lines();
      untracked(() => {
        const edits = { ...this.qtyEdits() };
        let changed = false;
        for (const line of lines) {
          if (edits[line.sku] === undefined) {
            edits[line.sku] = line.qty;
            changed = true;
          }
        }
        for (const sku of Object.keys(edits)) {
          if (!lines.some((line) => line.sku === sku)) {
            delete edits[sku];
            changed = true;
          }
        }
        if (changed) {
          this.qtyEdits.set(edits);
        }
      });
    });
  }

  bumpQty(sku: string, delta: number): void {
    const stock = this.catalog.find(sku)?.stock;
    const current = this.qtyEdits()[sku] ?? 1;
    const next = Math.max(1, current + delta);
    if (stock !== undefined && next > stock) {
      this.toast.show(`Only ${stock} in stock.`);
      this.qtyEdits.update((edits) => ({ ...edits, [sku]: stock }));
      return;
    }
    this.qtyEdits.update((edits) => ({ ...edits, [sku]: next }));
  }

  updateBag(): void {
    const before = this.qtyEdits();
    this.cart.applyQuantities(before);
    const next: Record<string, number> = {};
    let capped = false;
    for (const line of this.cart.lines()) {
      next[line.sku] = line.qty;
      if ((before[line.sku] ?? line.qty) > line.qty) {
        capped = true;
      }
    }
    this.qtyEdits.set(next);
    if (capped) {
      this.toast.show('Bag updated to match available stock.');
    }
  }

  remove(sku: string): void {
    this.cart.remove(sku);
  }

  readonly clearConfirmOpen = signal(false);

  requestClearBag(): void {
    if (this.hasLines() < 1) {
      return;
    }
    this.clearConfirmOpen.set(true);
  }

  cancelClearBag(): void {
    this.clearConfirmOpen.set(false);
  }

  confirmClearBag(): void {
    this.cart.clear();
    this.qtyEdits.set({});
    this.clearConfirmOpen.set(false);
  }

  useSavedDetails(): void {
    const profile = this.cart.savedProfile();
    if (!profile) {
      return;
    }
    this.cart.applySavedProfile(true);
    this.form.patchValue({
      email: profile.email,
      phone: profile.phone,
      fullName: profile.name,
      street: profile.street,
      suburb: profile.suburb,
      city: profile.city,
      province: profile.province,
      postalCode: profile.postalCode,
    });
    this.form.markAsPristine();
    this.toast.show('Saved account details applied.');
  }

  continue(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.refreshInvalidFields();
    if (this.form.invalid || this.hasLines() === 0) {
      return;
    }
    void this.router.navigate(['/pay']);
  }

  private refreshInvalidFields(): void {
    const fields = (Object.keys(checkoutFieldLabels) as (keyof CheckoutForm['controls'])[])
      .filter((key) => this.form.controls[key].invalid)
      .map((key) => checkoutFieldLabels[key]);
    if (this.hasLines() === 0) {
      fields.push('Your bag');
    }
    this.invalidFields.set(fields);
  }

  /** Sync cart → form for pristine controls only (incl. clearing when prefill is turned off). */
  private fill(control: CheckoutForm['controls'][keyof CheckoutForm['controls']], value: string): void {
    if (control.dirty || control.value === value) {
      return;
    }
    control.setValue(value, { emitEvent: false });
    control.markAsPristine();
  }
}
