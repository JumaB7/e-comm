import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ShopDesktopComponent } from './shop-desktop.component';
import { ShopMobileComponent } from './shop-mobile.component';
import { ViewportService } from '../services/viewport.service';

@Component({
  selector: 'app-shop',
  imports: [ShopDesktopComponent, ShopMobileComponent],
  template: `
    @if (isMobile()) {
      <app-shop-mobile />
    } @else {
      <app-shop-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
