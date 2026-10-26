import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { CheckoutBaseDirective } from './checkout-base.directive';

@Component({
  selector: 'app-checkout-mobile',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './checkout-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutMobileComponent extends CheckoutBaseDirective {}
