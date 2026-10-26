import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { PaidBaseDirective } from './paid-base.directive';

@Component({
  selector: 'app-paid-desktop',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './paid-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaidDesktopComponent extends PaidBaseDirective {}
