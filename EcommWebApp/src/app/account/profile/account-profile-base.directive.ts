import { Directive, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { AccountProfileForm, accountProfileForm } from './account-profile.form';

@Directive()
export class AccountProfileBaseDirective {
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  readonly form: AccountProfileForm = accountProfileForm();
  readonly submitted = signal(false);
  readonly ready = signal(false);
  readonly error = this.auth.error;
  readonly busy = this.auth.busy;

  constructor() {
    this.auth.error.set('');
    this.auth.profile().subscribe((profile) => {
      if (!profile) {
        this.ready.set(true);
        return;
      }
      this.form.setValue({
        fullName: profile.name,
        email: profile.email,
        phone: profile.phone,
        street: profile.street,
        suburb: profile.suburb,
        city: profile.city,
        province: profile.province,
        postalCode: profile.postalCode,
        delivery: profile.delivery,
        prefillCheckout: profile.prefillCheckout,
      });
      this.form.markAsPristine();
      this.cart.savedProfile.set(profile);
      this.ready.set(true);
    });
  }

  setDelivery(delivery: 'courier' | 'collect'): void {
    this.form.controls.delivery.setValue(delivery);
    this.form.controls.delivery.markAsDirty();
  }

  save(event: Event): void {
    event.preventDefault();
    if (this.busy()) {
      return;
    }
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.auth
      .updateProfile({
        name: value.fullName,
        email: value.email,
        phone: value.phone,
        street: value.street,
        suburb: value.suburb,
        city: value.city,
        province: value.province,
        postalCode: value.postalCode,
        delivery: value.delivery,
        prefillCheckout: value.prefillCheckout,
      })
      .subscribe((profile) => {
        if (!profile) {
          return;
        }
        this.cart.savedProfile.set(profile);
        this.form.markAsPristine();
        this.toast.show('Account details saved.');
      });
  }
}
