import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminProductsDesktopComponent } from './products-desktop.component';
import { AdminProductsMobileComponent } from './products-mobile.component';
import { ViewportService } from '../../services/viewport.service';

@Component({
  selector: 'app-admin-products',
  imports: [AdminProductsDesktopComponent, AdminProductsMobileComponent],
  template: `
    @if (isMobile()) {
      <app-admin-products-mobile />
    } @else {
      <app-admin-products-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
