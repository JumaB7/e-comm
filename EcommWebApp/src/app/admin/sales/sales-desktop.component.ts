import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SalesBaseDirective } from './sales-base.directive';
import { SalesChartComponent } from './sales-chart.component';

@Component({
  selector: 'app-sales-desktop',
  imports: [NgClass, SalesChartComponent],
  templateUrl: './sales-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesDesktopComponent extends SalesBaseDirective {}
