import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from 'ecomm-components';
import { StockBaseDirective } from './stock-base.directive';

@Component({
  selector: 'app-stock-desktop',
  imports: [ButtonComponent],
  templateUrl: './stock-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDesktopComponent extends StockBaseDirective {}
