import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProductCardBaseDirective } from './product-card-base.directive';

@Component({
  selector: 'ecomm-product-card-desktop',
  templateUrl: './product-card-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardDesktopComponent extends ProductCardBaseDirective {}
