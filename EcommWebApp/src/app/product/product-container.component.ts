import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { ProductDesktopComponent } from './product-desktop.component';
import { ProductMobileComponent } from './product-mobile.component';

@Component({
  selector: 'app-product',
  imports: [BreakpointDirective, ProductDesktopComponent, ProductMobileComponent],
  template: `
    <app-product-desktop *appBreakpoint="'desktop'" />
    <app-product-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductContainerComponent {}
