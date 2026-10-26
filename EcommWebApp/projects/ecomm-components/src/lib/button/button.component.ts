import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ecomm-button',
  imports: [NgClass],
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly label = input('');
  readonly variant = input<'primary' | 'secondary'>('primary');
  readonly full = input(false);
  protected readonly classes = computed(() => {
    const width = this.full() ? 'w-full' : '';
    const look =
      this.variant() === 'secondary'
        ? 'border border-ink bg-white'
        : 'bg-action';
    return `${width} ${look} px-6 py-3 text-center font-semibold`;
  });
}
