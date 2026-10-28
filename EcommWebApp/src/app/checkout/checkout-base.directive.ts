import { Directive, inject } from '@angular/core';
import { CartService } from '../services/cart.service';

@Directive()
export class CheckoutBaseDirective {
  private readonly cart = inject(CartService);
  readonly lines = this.cart.displayLines;
  readonly subtotal = this.cart.subtotalLabel;
  readonly courier = this.cart.courierLabel;
  readonly courierFee = this.cart.courierFeeLabel;
  readonly total = this.cart.totalLabel;
  readonly delivery = this.cart.delivery;
  readonly deliveryChoice = this.cart.deliveryChoice;
  readonly hasLines = this.cart.count;
  readonly email = this.cart.email;
  readonly phone = this.cart.phone;
  readonly fullName = this.cart.fullName;
  readonly street = this.cart.street;
  readonly suburb = this.cart.suburb;
  readonly city = this.cart.city;
  readonly province = this.cart.province;
  readonly postalCode = this.cart.postalCode;

  setContact(
    field: 'email' | 'phone' | 'fullName' | 'street' | 'suburb' | 'city' | 'province' | 'postalCode',
    event: Event,
  ): void {
    const value = (event.target as HTMLInputElement).value;
    this.cart.setContact(field, value);
  }
}
