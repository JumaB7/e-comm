import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './spinner/loading-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingOverlayComponent],
  template: '<router-outlet /><app-loading-overlay />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
