import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SignInDesktopComponent } from './sign-in-desktop.component';
import { SignInMobileComponent } from './sign-in-mobile.component';
import { ViewportService } from '../services/viewport.service';

@Component({
  selector: 'app-sign-in',
  imports: [SignInDesktopComponent, SignInMobileComponent],
  template: `
    @if (isMobile()) {
      <app-sign-in-mobile />
    } @else {
      <app-sign-in-desktop />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
}
