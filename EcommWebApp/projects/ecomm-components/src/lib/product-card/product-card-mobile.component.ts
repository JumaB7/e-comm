import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ecomm-product-card-mobile',
  templateUrl: './product-card-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardMobileComponent {
  readonly name = input('');
  readonly category = input('');
  readonly price = input('');
  readonly sku = input('');
  readonly image = input('');
  readonly photo = computed(() => this.image());
}
