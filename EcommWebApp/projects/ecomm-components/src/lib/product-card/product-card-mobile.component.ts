import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusPillComponent } from '../status-pill/status-pill.component';

@Component({
  selector: 'ecomm-product-card-mobile',
  imports: [StatusPillComponent],
  templateUrl: './product-card-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardMobileComponent {
  readonly name = input('');
  readonly category = input('');
  readonly price = input('');
  readonly sku = input('');
  readonly image = input('');
  readonly stock = input<number | undefined>(undefined);
  readonly photo = computed(() => this.image());
  readonly outOfStock = computed(() => {
    const stock = this.stock();
    return stock !== undefined && stock < 1;
  });
  readonly lowStockHint = computed(() => {
    const stock = this.stock();
    if (stock === undefined || stock < 1 || stock > 5) {
      return '';
    }
    return stock === 1 ? 'Only 1 left' : `Only ${stock} left`;
  });
}
