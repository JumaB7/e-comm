import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ecomm-product-card-desktop',
  templateUrl: './product-card-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardDesktopComponent {
  readonly name = input('');
  readonly category = input('');
  readonly price = input('');
  readonly sku = input('');
  readonly image = input('');
  readonly photo = computed(() => this.image());
}
