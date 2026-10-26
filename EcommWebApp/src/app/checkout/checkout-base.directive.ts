import { Directive } from '@angular/core';

@Directive()
export class CheckoutBaseDirective {
  readonly lines = [
    { name: '10×42 binoculars', price: 'R 8 450' },
    { name: 'Merino stalking shirt', price: 'R 1 290' },
  ];
  readonly courier = 'R 120';
  readonly total = 'R 9 860';
}
