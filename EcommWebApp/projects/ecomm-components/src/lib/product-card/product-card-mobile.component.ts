import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProductCardBaseDirective } from './product-card-base.directive';

@Component({
  selector: 'ecomm-product-card-mobile',
  templateUrl: './product-card-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardMobileComponent extends ProductCardBaseDirective {}
