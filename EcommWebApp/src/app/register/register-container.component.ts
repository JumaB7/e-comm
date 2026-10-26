import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RegisterDesktopComponent } from './register-desktop.component';
import { RegisterMobileComponent } from './register-mobile.component';
import { ViewportService } from '../services/viewport.service';

@Component({
  selector: 'app-register',
  imports: [RegisterDesktopComponent, RegisterMobileComponent],
  template: `
    @if (isMobile()) {
      <app-register-mobile />
    } @else {
      <app-register-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
