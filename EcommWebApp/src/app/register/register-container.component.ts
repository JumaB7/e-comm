import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { RegisterDesktopComponent } from './register-desktop.component';
import { RegisterMobileComponent } from './register-mobile.component';

@Component({
  selector: 'app-register',
  imports: [BreakpointDirective, RegisterDesktopComponent, RegisterMobileComponent],
  template: `
    <app-register-desktop *appBreakpoint="'desktop'" />
    <app-register-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterContainerComponent {}
