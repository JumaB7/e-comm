import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ecomm-status-pill',
  imports: [NgClass],
  templateUrl: './status-pill.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPillComponent {
  readonly label = input('');
  readonly tone = input<'paid' | 'packed' | 'awaiting' | 'low' | 'ship' | 'collect'>('paid');
  protected readonly classes = computed(() => {
    const base = 'inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium leading-4';
    switch (this.tone()) {
      case 'paid':
        return `${base} bg-success text-white`;
      case 'packed':
        return `${base} bg-action text-white`;
      case 'ship':
        return `${base} bg-ink text-white`;
      case 'collect':
        return `${base} border border-ink bg-white text-ink`;
      case 'low':
        return `${base} bg-danger text-white`;
      default:
        return `${base} border border-line bg-canvas text-ink`;
    }
  });
}
