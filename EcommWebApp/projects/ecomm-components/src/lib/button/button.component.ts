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
  readonly variant = input<'primary' | 'secondary' | 'inverse'>('primary');
  readonly full = input(false);
  readonly chevron = input(false);
  protected readonly classes = computed(() => {
    const width = this.full() ? 'w-full' : '';
    const base =
      'inline-flex items-center justify-center rounded-sm px-6 py-4 text-center text-15 font-semibold leading-5';
    const look =
      this.variant() === 'secondary'
        ? 'border border-ink bg-white text-ink'
        : this.variant() === 'inverse'
          ? 'border border-white bg-transparent text-white'
          : 'bg-action text-white';
    return `${base} ${width} ${look}`;
  });
}
