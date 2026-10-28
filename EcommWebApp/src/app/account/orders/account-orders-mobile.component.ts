import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusPillComponent } from 'ecomm-components';
import { AccountOrdersBaseDirective } from './account-orders-base.directive';

@Component({
  selector: 'app-account-orders-mobile',
  imports: [RouterLink, StatusPillComponent],
  templateUrl: './account-orders-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrdersMobileComponent extends AccountOrdersBaseDirective {}
