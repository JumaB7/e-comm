import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CheckoutDesktopComponent } from './checkout-desktop.component';
import { CheckoutMobileComponent } from './checkout-mobile.component';
import { ViewportService } from '../services/viewport.service';

@Component({
  selector: 'app-checkout',
  imports: [CheckoutDesktopComponent, CheckoutMobileComponent],
  template: `
    @if (isMobile()) {
      <app-checkout-mobile />
    } @else {
      <app-checkout-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
