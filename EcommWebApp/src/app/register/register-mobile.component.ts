import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';

@Component({
  selector: 'app-register-mobile',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './register-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterMobileComponent {}
