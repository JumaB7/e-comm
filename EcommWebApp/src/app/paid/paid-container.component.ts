import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PaidDesktopComponent } from './paid-desktop.component';
import { PaidMobileComponent } from './paid-mobile.component';
import { ViewportService } from '../services/viewport.service';

@Component({
  selector: 'app-paid',
  imports: [PaidDesktopComponent, PaidMobileComponent],
  template: `
    @if (isMobile()) {
      <app-paid-mobile />
    } @else {
      <app-paid-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaidContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
