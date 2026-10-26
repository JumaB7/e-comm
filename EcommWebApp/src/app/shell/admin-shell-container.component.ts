import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminShellDesktopComponent } from './admin-shell-desktop.component';
import { AdminShellMobileComponent } from './admin-shell-mobile.component';
import { ViewportService } from '../services/viewport.service';

@Component({
  selector: 'app-admin-shell',
  imports: [AdminShellDesktopComponent, AdminShellMobileComponent],
  template: `
    @if (isMobile()) {
      <app-admin-shell-mobile />
    } @else {
      <app-admin-shell-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
