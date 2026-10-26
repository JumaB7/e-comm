import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';

@Component({
  selector: 'app-paid-desktop',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './paid-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaidDesktopComponent {}
