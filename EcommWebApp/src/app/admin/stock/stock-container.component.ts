import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StockDesktopComponent } from './stock-desktop.component';
import { StockMobileComponent } from './stock-mobile.component';
import { ViewportService } from '../../services/viewport.service';

@Component({
  selector: 'app-stock',
  imports: [StockDesktopComponent, StockMobileComponent],
  template: `
    @if (isMobile()) {
      <app-stock-mobile />
    } @else {
      <app-stock-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
