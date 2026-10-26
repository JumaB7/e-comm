import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusPillComponent } from 'ecomm-components';
import { OrdersBaseDirective } from './orders-base.directive';

@Component({
  selector: 'app-orders-mobile',
  imports: [RouterLink, StatusPillComponent],
  templateUrl: './orders-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersMobileComponent extends OrdersBaseDirective {}
