import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatusPillComponent } from 'ecomm-components';
import { AdminProductsBaseDirective } from './products-base.directive';

@Component({
  selector: 'app-admin-products-mobile',
  imports: [StatusPillComponent],
  templateUrl: './products-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsMobileComponent extends AdminProductsBaseDirective {}
