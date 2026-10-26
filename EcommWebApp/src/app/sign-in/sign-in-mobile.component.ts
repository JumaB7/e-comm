import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';

@Component({
  selector: 'app-sign-in-mobile',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './sign-in-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInMobileComponent {}
