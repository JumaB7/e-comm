import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../../directives/breakpoint.directive';
import { OrdersDesktopComponent } from './orders-desktop.component';
import { OrdersMobileComponent } from './orders-mobile.component';

@Component({
  selector: 'app-orders',
  imports: [BreakpointDirective, OrdersDesktopComponent, OrdersMobileComponent],
  template: `
    <app-orders-desktop *appBreakpoint="'desktop'" />
    <app-orders-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersContainerComponent {}
