import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HomeDesktopComponent } from './home-desktop.component';
import { HomeMobileComponent } from './home-mobile.component';
import { ViewportService } from '../services/viewport.service';

@Component({
  selector: 'app-home',
  imports: [HomeDesktopComponent, HomeMobileComponent],
  template: `
    @if (isMobile()) {
      <app-home-mobile />
    } @else {
      <app-home-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
