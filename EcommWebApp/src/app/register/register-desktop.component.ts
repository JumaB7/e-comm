import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { RegisterBaseDirective } from './register-base.directive';

@Component({
  selector: 'app-register-desktop',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './register-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterDesktopComponent extends RegisterBaseDirective {}
