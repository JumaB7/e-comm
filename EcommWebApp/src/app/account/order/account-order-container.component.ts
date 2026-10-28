import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../../directives/breakpoint.directive';
import { AccountOrderDesktopComponent } from './account-order-desktop.component';
import { AccountOrderMobileComponent } from './account-order-mobile.component';

@Component({
  selector: 'app-account-order',
  imports: [BreakpointDirective, AccountOrderDesktopComponent, AccountOrderMobileComponent],
  template: `
    <app-account-order-desktop *appBreakpoint="'desktop'" />
    <app-account-order-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrderContainerComponent {}
