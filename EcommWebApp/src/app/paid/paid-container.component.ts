import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { PaidDesktopComponent } from './paid-desktop.component';
import { PaidMobileComponent } from './paid-mobile.component';

@Component({
  selector: 'app-paid',
  imports: [BreakpointDirective, PaidDesktopComponent, PaidMobileComponent],
  template: `
    <app-paid-desktop *appBreakpoint="'desktop'" />
    <app-paid-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaidContainerComponent {}
