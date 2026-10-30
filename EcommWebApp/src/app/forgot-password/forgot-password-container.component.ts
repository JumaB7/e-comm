import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { ForgotPasswordDesktopComponent } from './forgot-password-desktop.component';
import { ForgotPasswordMobileComponent } from './forgot-password-mobile.component';

@Component({
  selector: 'app-forgot-password',
  imports: [BreakpointDirective, ForgotPasswordDesktopComponent, ForgotPasswordMobileComponent],
  template: `
    <app-forgot-password-desktop *appBreakpoint="'desktop'" />
    <app-forgot-password-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordContainerComponent {}
