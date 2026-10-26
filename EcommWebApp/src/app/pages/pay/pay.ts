import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface PayMethod {
  id: string;
  title: string;
  detail: string;
}

@Component({
  selector: 'app-pay',
  imports: [NgClass],
  templateUrl: './pay.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayPage {
  protected readonly methods = signal<PayMethod[]>([
    { id: 'card', title: 'Card', detail: 'Visa or Mastercard on PayFast' },
    { id: 'eft', title: 'Instant EFT', detail: 'FNB, Absa, Standard Bank, Nedbank, and others' },
    { id: 'capitec', title: 'Capitec Pay', detail: 'Pay from the Capitec app' },
  ]);
  protected readonly selected = signal('card');

  protected select(id: string): void {
    this.selected.set(id);
  }
}
