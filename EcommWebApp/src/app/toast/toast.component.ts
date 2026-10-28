import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [RouterLink],
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private readonly toast = inject(ToastService);
  readonly message = this.toast.message;

  dismiss(): void {
    this.toast.dismiss();
  }
}
