import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { RegisterBaseDirective } from './register-base.directive';

@Component({
  selector: 'app-register-desktop',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './register-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterDesktopComponent extends RegisterBaseDirective {}
