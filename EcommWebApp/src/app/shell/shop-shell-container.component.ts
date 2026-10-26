import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ShopShellDesktopComponent } from './shop-shell-desktop.component';
import { ShopShellMobileComponent } from './shop-shell-mobile.component';
import { ViewportService } from '../services/viewport.service';

@Component({
  selector: 'app-shop-shell',
  imports: [ShopShellDesktopComponent, ShopShellMobileComponent],
  template: `
    @if (isMobile()) {
      <app-shop-shell-mobile />
    } @else {
      <app-shop-shell-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopShellContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
