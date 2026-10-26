import { Directive, inject } from '@angular/core';
import { CartService } from '../services/cart.service';

@Directive()
export class PaidBaseDirective {
  private readonly cart = inject(CartService);
  readonly total = this.cart.totalLabel;
  readonly deliveryNote = this.cart.deliveryNote;
}
