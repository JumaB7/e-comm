import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { PayDesktopComponent } from './pay-desktop.component';
import { PayMobileComponent } from './pay-mobile.component';

@Component({
  selector: 'app-pay',
  imports: [BreakpointDirective, PayDesktopComponent, PayMobileComponent],
  template: `
    <app-pay-desktop *appBreakpoint="'desktop'" />
    <app-pay-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayContainerComponent {}
