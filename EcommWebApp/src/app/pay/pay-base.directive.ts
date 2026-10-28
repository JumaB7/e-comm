import { Directive, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class PayBaseDirective {
  private readonly cart = inject(CartService);
  private readonly catalog = inject(CatalogService);
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
    this.paying.set(true);
    this.error.set('');
    this.catalog.pay({ ...this.cart.checkout(), method: this.selected() }).subscribe({
      next: (order) => {
        if (!order) {
          return;
        }
        this.cart.clear();
        void this.router.navigate(['/paid'], { queryParams: { receipt: sessionStorage.getItem('veld-receipt') ?? '' } });
      },
      error: (error: Error) => {
        this.paying.set(false);
        this.error.set(error.message);
      },
    });
  }
}
