import { Directive, inject } from '@angular/core';
import { CartService } from '../services/cart.service';

@Directive()
export class ShopShellBaseDirective {
  private readonly cart = inject(CartService);
  readonly bagCount = this.cart.count;
  readonly links = [
    { label: 'Shop', path: '/shop' },
    { label: 'Optics', path: '/shop' },
    { label: 'Apparel', path: '/shop' },
    { label: 'Camp', path: '/shop' },
    { label: 'Knives', path: '/shop' },
  ];
}
