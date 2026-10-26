import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OrderDesktopComponent } from './order-desktop.component';
import { OrderMobileComponent } from './order-mobile.component';
import { ViewportService } from '../../services/viewport.service';

@Component({
  selector: 'app-order',
  imports: [OrderDesktopComponent, OrderMobileComponent],
  template: `
    @if (isMobile()) {
      <app-order-mobile />
    } @else {
      <app-order-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
