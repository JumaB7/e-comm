import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OrdersDesktopComponent } from './orders-desktop.component';
import { OrdersMobileComponent } from './orders-mobile.component';
import { ViewportService } from '../../services/viewport.service';

@Component({
  selector: 'app-orders',
  imports: [OrdersDesktopComponent, OrdersMobileComponent],
  template: `
    @if (isMobile()) {
      <app-orders-mobile />
    } @else {
      <app-orders-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
