import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { SignInDesktopComponent } from './sign-in-desktop.component';
import { SignInMobileComponent } from './sign-in-mobile.component';

@Component({
  selector: 'app-sign-in',
  imports: [BreakpointDirective, SignInDesktopComponent, SignInMobileComponent],
  template: `
    <app-sign-in-desktop *appBreakpoint="'desktop'" />
    <app-sign-in-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInContainerComponent {}
