import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, StatusPillComponent } from 'ecomm-components';
import { OrderDetailBaseDirective } from './order-base.directive';

@Component({
  selector: 'app-order-mobile',
  imports: [ButtonComponent, StatusPillComponent],
  templateUrl: './order-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderMobileComponent extends OrderDetailBaseDirective {}
