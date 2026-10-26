import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { RegisterBaseDirective } from './register-base.directive';

@Component({
  selector: 'app-register-mobile',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './register-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterMobileComponent extends RegisterBaseDirective {}
