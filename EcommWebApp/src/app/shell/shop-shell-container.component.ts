import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { ShopShellDesktopComponent } from './shop-shell-desktop.component';
import { ShopShellMobileComponent } from './shop-shell-mobile.component';

@Component({
  selector: 'app-shop-shell',
  imports: [BreakpointDirective, ShopShellDesktopComponent, ShopShellMobileComponent],
  template: `
    <app-shop-shell-desktop *appBreakpoint="'desktop'" />
    <app-shop-shell-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopShellContainerComponent {}
