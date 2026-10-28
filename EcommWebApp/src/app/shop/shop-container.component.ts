import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { ShopDesktopComponent } from './shop-desktop.component';
import { ShopMobileComponent } from './shop-mobile.component';

@Component({
  selector: 'app-shop',
  imports: [BreakpointDirective, ShopDesktopComponent, ShopMobileComponent],
  template: `
    <app-shop-desktop *appBreakpoint="'desktop'" />
    <app-shop-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopContainerComponent {}
