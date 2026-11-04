import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { ErrorDesktopComponent } from './error-desktop.component';
import { ErrorMobileComponent } from './error-mobile.component';

@Component({
  selector: 'app-error',
  imports: [BreakpointDirective, ErrorDesktopComponent, ErrorMobileComponent],
  template: `
    <app-error-desktop *appBreakpoint="'desktop'" />
    <app-error-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorContainerComponent {}
