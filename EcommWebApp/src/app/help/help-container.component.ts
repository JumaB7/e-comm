import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { HelpDesktopComponent } from './help-desktop.component';
import { HelpMobileComponent } from './help-mobile.component';

@Component({
  selector: 'app-help',
  imports: [BreakpointDirective, HelpDesktopComponent, HelpMobileComponent],
  template: `
    <app-help-desktop *appBreakpoint="'desktop'" />
    <app-help-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpContainerComponent {}
