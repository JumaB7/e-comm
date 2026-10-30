import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { ResetPasswordBase } from './reset-password-base';

@Component({
  selector: 'app-reset-password-desktop',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './reset-password-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordDesktopComponent extends ResetPasswordBase {}
