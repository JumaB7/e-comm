import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../../directives/breakpoint.directive';
import { AdminProductsDesktopComponent } from './products-desktop.component';
import { AdminProductsMobileComponent } from './products-mobile.component';

@Component({
  selector: 'app-admin-products',
  imports: [BreakpointDirective, AdminProductsDesktopComponent, AdminProductsMobileComponent],
  template: `
    <app-admin-products-desktop *appBreakpoint="'desktop'" />
    <app-admin-products-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsContainerComponent {}
