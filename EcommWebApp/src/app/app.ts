import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinnerService } from './services/spinner.service';
import { LoadingOverlayComponent } from './spinner/loading-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingOverlayComponent],
  template: '<router-outlet /><app-loading-overlay />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    inject(SpinnerService).show();
  }
}
