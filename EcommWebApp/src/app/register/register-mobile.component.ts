import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { RegisterBaseDirective } from './register-base.directive';

@Component({
  selector: 'app-register-mobile',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './register-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterMobileComponent extends RegisterBaseDirective {}
