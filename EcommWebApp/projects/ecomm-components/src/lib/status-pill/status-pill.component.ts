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
  readonly tone = input<'paid' | 'packed' | 'awaiting' | 'low'>('paid');
  protected readonly classes = computed(() => {
    switch (this.tone()) {
      case 'paid':
        return 'text-success';
      case 'low':
        return 'text-danger';
      case 'awaiting':
        return 'border border-line bg-canvas text-ink';
      default:
        return 'text-ink';
    }
  });
}
