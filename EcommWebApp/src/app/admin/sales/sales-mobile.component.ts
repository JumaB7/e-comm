import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SalesBaseDirective } from './sales-base.directive';
import { SalesChartComponent } from './sales-chart.component';

@Component({
  selector: 'app-sales-mobile',
  imports: [NgClass, SalesChartComponent],
  templateUrl: './sales-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesMobileComponent extends SalesBaseDirective {}
