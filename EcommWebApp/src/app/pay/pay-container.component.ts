import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PayDesktopComponent } from './pay-desktop.component';
import { PayMobileComponent } from './pay-mobile.component';
import { ViewportService } from '../services/viewport.service';

@Component({
  selector: 'app-pay',
  imports: [PayDesktopComponent, PayMobileComponent],
  template: `
    @if (isMobile()) {
      <app-pay-mobile />
    } @else {
      <app-pay-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
