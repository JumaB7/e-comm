import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatusPillComponent } from 'ecomm-components';
import { OrderDetailBaseDirective } from './order-base.directive';

@Component({
  selector: 'app-order-desktop',
  imports: [StatusPillComponent],
  templateUrl: './order-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDesktopComponent extends OrderDetailBaseDirective {}
