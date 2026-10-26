import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';

@Component({
  selector: 'app-register-desktop',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './register-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterDesktopComponent {}
