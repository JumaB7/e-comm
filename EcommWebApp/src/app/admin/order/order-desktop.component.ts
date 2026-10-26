import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, StatusPillComponent } from 'ecomm-components';
import { OrderDetailBaseDirective } from './order-base.directive';

@Component({
  selector: 'app-order-desktop',
  imports: [ButtonComponent, StatusPillComponent],
  templateUrl: './order-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDesktopComponent extends OrderDetailBaseDirective {}
