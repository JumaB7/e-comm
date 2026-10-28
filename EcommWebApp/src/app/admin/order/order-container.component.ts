import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../../directives/breakpoint.directive';
import { OrderDesktopComponent } from './order-desktop.component';
import { OrderMobileComponent } from './order-mobile.component';

@Component({
  selector: 'app-order',
  imports: [BreakpointDirective, OrderDesktopComponent, OrderMobileComponent],
  template: `
    <app-order-desktop *appBreakpoint="'desktop'" />
    <app-order-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderContainerComponent {}
