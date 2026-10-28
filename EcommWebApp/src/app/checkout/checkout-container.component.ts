import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { CheckoutDesktopComponent } from './checkout-desktop.component';
import { CheckoutMobileComponent } from './checkout-mobile.component';

@Component({
  selector: 'app-checkout',
  imports: [BreakpointDirective, CheckoutDesktopComponent, CheckoutMobileComponent],
  template: `
    <app-checkout-desktop *appBreakpoint="'desktop'" />
    <app-checkout-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutContainerComponent {}
