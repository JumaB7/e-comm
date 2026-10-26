import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';

@Component({
  selector: 'app-paid-mobile',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './paid-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaidMobileComponent {}
