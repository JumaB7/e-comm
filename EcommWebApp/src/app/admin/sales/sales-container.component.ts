import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SalesDesktopComponent } from './sales-desktop.component';
import { SalesMobileComponent } from './sales-mobile.component';
import { ViewportService } from '../../services/viewport.service';

@Component({
  selector: 'app-sales',
  imports: [SalesDesktopComponent, SalesMobileComponent],
  template: `
    @if (isMobile()) {
      <app-sales-mobile />
    } @else {
      <app-sales-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
