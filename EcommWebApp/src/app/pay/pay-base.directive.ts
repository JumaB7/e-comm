import { Directive, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { checkoutForm } from '../checkout/checkout.form';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { SessionStoreService } from '../services/session-store.service';

@Directive()
export class PayBaseDirective {
  private readonly cart = inject(CartService);
  private readonly catalog = inject(CatalogService);
  private readonly session = inject(SessionStoreService);
  private readonly router = inject(Router);
  readonly methods = [
    { id: 'card', title: 'Card', detail: 'Visa or Mastercard on PayFast' },
    { id: 'eft', title: 'Instant EFT', detail: 'FNB, Absa, Standard Bank, Nedbank, and others' },
    { id: 'capitec', title: 'Capitec Pay', detail: 'Pay from the Capitec app' },
  ];
  readonly selected = signal('card');
  readonly paying = signal(false);
  readonly error = signal('');
  readonly lines = this.cart.displayLines;
  readonly delivery = this.cart.delivery;
  readonly courier = this.cart.courierLabel;
  readonly total = this.cart.totalLabel;

  pay(): void {
    if (this.paying()) {
      return;
    }
    if (this.cart.count() === 0) {
      this.error.set('The bag is empty.');
      return;
    }
    const details = this.cart.checkout();
    const contact = checkoutForm();
    contact.setValue({
      email: details.email,
      phone: details.phone,
      fullName: details.name,
      street: details.street,
      suburb: details.suburb,
      city: details.city,
      province: details.province,
      postalCode: details.postalCode,
    });
    if (contact.invalid) {
      this.error.set('Go back and complete the delivery details.');
      return;
    }
    this.paying.set(true);
    this.error.set('');
    this.catalog.pay({ ...this.cart.checkout(), method: this.selected() }).subscribe({
      next: (order) => {
        if (!order) {
          return;
        }
        this.cart.clear();
        void this.router.navigate(['/paid'], { queryParams: { receipt: this.session.getReceipt() ?? '' } });
      },
      error: (error: Error) => {
        this.paying.set(false);
        this.error.set(error.message);
      },
    });
  }
}
