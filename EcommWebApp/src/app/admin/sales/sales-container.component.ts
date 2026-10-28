import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../../directives/breakpoint.directive';
import { SalesDesktopComponent } from './sales-desktop.component';
import { SalesMobileComponent } from './sales-mobile.component';

@Component({
  selector: 'app-sales',
  imports: [BreakpointDirective, SalesDesktopComponent, SalesMobileComponent],
  template: `
    <app-sales-desktop *appBreakpoint="'desktop'" />
    <app-sales-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesContainerComponent {}
