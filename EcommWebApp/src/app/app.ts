import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './spinner/loading-overlay.component';
import { ToastComponent } from './toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingOverlayComponent, ToastComponent],
  template: '<router-outlet /><app-toast /><app-loading-overlay />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
