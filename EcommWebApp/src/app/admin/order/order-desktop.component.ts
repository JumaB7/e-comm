import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, StatusPillComponent } from 'ecomm-components';
import { OrderDetailBaseDirective } from './order-base.directive';

@Component({
  selector: 'app-order-desktop',
  imports: [RouterLink, ButtonComponent, StatusPillComponent],
  templateUrl: './order-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDesktopComponent extends OrderDetailBaseDirective {}
