import { Directive, inject, signal } from '@angular/core';
import { CartService } from '../services/cart.service';

@Directive()
export class PayBaseDirective {
  private readonly cart = inject(CartService);
  readonly methods = [
    { id: 'card', title: 'Card', detail: 'Visa or Mastercard on PayFast' },
    { id: 'eft', title: 'Instant EFT', detail: 'FNB, Absa, Standard Bank, Nedbank, and others' },
    { id: 'capitec', title: 'Capitec Pay', detail: 'Pay from the Capitec app' },
  ];
  readonly selected = signal('card');
  readonly lines = this.cart.displayLines;
  readonly courier = this.cart.courierLabel;
  readonly total = this.cart.totalLabel;
}
