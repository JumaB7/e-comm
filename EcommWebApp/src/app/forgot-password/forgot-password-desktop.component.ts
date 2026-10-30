import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { ForgotPasswordBase } from './forgot-password-base';

@Component({
  selector: 'app-forgot-password-desktop',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './forgot-password-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordDesktopComponent extends ForgotPasswordBase {}
