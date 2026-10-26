import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductDesktopComponent } from './product-desktop.component';
import { ProductMobileComponent } from './product-mobile.component';
import { ViewportService } from '../services/viewport.service';

@Component({
  selector: 'app-product',
  imports: [ProductDesktopComponent, ProductMobileComponent],
  template: `
    @if (isMobile()) {
      <app-product-mobile />
    } @else {
      <app-product-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
