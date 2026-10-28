import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../../directives/breakpoint.directive';
import { AccountOrdersDesktopComponent } from './account-orders-desktop.component';
import { AccountOrdersMobileComponent } from './account-orders-mobile.component';

@Component({
  selector: 'app-account-orders',
  imports: [BreakpointDirective, AccountOrdersDesktopComponent, AccountOrdersMobileComponent],
  template: `
    <app-account-orders-desktop *appBreakpoint="'desktop'" />
    <app-account-orders-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrdersContainerComponent {}
