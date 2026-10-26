import { Directive, signal } from '@angular/core';

@Directive()
export class PayBaseDirective {
  readonly methods = [
    { id: 'card', title: 'Card', detail: 'Visa or Mastercard on PayFast' },
    { id: 'eft', title: 'Instant EFT', detail: 'FNB, Absa, Standard Bank, Nedbank, and others' },
    { id: 'capitec', title: 'Capitec Pay', detail: 'Pay from the Capitec app' },
  ];
  readonly selected = signal('card');
  readonly total = 'R 9 860';
}
