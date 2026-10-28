import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StockBaseDirective } from './stock-base.directive';

@Component({
  selector: 'app-stock-desktop',
  imports: [NgClass],
  templateUrl: './stock-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDesktopComponent extends StockBaseDirective {}
