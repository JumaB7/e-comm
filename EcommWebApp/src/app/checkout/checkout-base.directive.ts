import { Directive, inject } from '@angular/core';
import { CartService } from '../services/cart.service';

@Directive()
export class CheckoutBaseDirective {
  private readonly cart = inject(CartService);
  readonly lines = this.cart.displayLines;
  readonly subtotal = this.cart.subtotalLabel;
  readonly courier = this.cart.courierLabel;
  readonly total = this.cart.totalLabel;
  readonly delivery = this.cart.delivery;
  readonly hasLines = this.cart.count;
}
