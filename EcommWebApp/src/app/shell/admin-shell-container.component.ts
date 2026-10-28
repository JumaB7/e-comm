import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { AdminShellDesktopComponent } from './admin-shell-desktop.component';
import { AdminShellMobileComponent } from './admin-shell-mobile.component';

@Component({
  selector: 'app-admin-shell',
  imports: [BreakpointDirective, AdminShellDesktopComponent, AdminShellMobileComponent],
  template: `
    <app-admin-shell-desktop *appBreakpoint="'desktop'" />
    <app-admin-shell-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellContainerComponent {}
