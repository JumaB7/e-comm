import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusPillComponent } from 'ecomm-components';
import { OrdersBaseDirective } from './orders-base.directive';

@Component({
  selector: 'app-orders-desktop',
  imports: [RouterLink, StatusPillComponent],
  templateUrl: './orders-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersDesktopComponent extends OrdersBaseDirective {}
