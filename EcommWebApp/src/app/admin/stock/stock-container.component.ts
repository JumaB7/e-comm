import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../../directives/breakpoint.directive';
import { StockDesktopComponent } from './stock-desktop.component';
import { StockMobileComponent } from './stock-mobile.component';

@Component({
  selector: 'app-stock',
  imports: [BreakpointDirective, StockDesktopComponent, StockMobileComponent],
  template: `
    <app-stock-desktop *appBreakpoint="'desktop'" />
    <app-stock-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockContainerComponent {}
