import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { SignInBaseDirective } from './sign-in-base.directive';

@Component({
  selector: 'app-sign-in-desktop',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './sign-in-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInDesktopComponent extends SignInBaseDirective {}
