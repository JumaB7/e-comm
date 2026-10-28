import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StockBaseDirective } from './stock-base.directive';

@Component({
  selector: 'app-stock-mobile',
  imports: [NgClass],
  templateUrl: './stock-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockMobileComponent extends StockBaseDirective {}
