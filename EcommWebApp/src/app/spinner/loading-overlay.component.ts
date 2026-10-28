import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SpinnerService } from '../services/spinner.service';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlayComponent {
  private readonly spinner = inject(SpinnerService);
  readonly loading = this.spinner.isLoading;
}
