import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { ResetPasswordDesktopComponent } from './reset-password-desktop.component';
import { ResetPasswordMobileComponent } from './reset-password-mobile.component';

@Component({
  selector: 'app-reset-password',
  imports: [BreakpointDirective, ResetPasswordDesktopComponent, ResetPasswordMobileComponent],
  template: `
    <app-reset-password-desktop *appBreakpoint="'desktop'" />
    <app-reset-password-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordContainerComponent {}
