import { Directive, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CheckoutForm, checkoutForm } from './checkout.form';

@Directive()
export class CheckoutBaseDirective {
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  readonly lines = this.cart.displayLines;
  readonly subtotal = this.cart.subtotalLabel;
  readonly courier = this.cart.courierLabel;
  readonly courierFee = this.cart.courierFeeLabel;
  readonly total = this.cart.totalLabel;
  readonly delivery = this.cart.delivery;
  readonly deliveryChoice = this.cart.deliveryChoice;
  readonly hasLines = this.cart.count;
  readonly submitted = signal(false);
  readonly form: CheckoutForm = checkoutForm();

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
  }

  continue(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.hasLines() === 0) {
      return;
    }
    void this.router.navigate(['/pay']);
  }

  private fill(control: CheckoutForm['controls'][keyof CheckoutForm['controls']], value: string): void {
    if (control.dirty || !value) {
      return;
    }
    control.setValue(value, { emitEvent: false });
    control.markAsPristine();
  }
}
