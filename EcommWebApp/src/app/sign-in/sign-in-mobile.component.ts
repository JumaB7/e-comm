import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { SignInBaseDirective } from './sign-in-base.directive';

@Component({
  selector: 'app-sign-in-mobile',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './sign-in-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInMobileComponent extends SignInBaseDirective {}
