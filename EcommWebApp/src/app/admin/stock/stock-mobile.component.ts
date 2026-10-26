import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from 'ecomm-components';
import { StockBaseDirective } from './stock-base.directive';

@Component({
  selector: 'app-stock-mobile',
  imports: [ButtonComponent],
  templateUrl: './stock-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockMobileComponent extends StockBaseDirective {}
