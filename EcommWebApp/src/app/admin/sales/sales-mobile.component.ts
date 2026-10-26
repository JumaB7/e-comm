import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SalesBaseDirective } from './sales-base.directive';

@Component({
  selector: 'app-sales-mobile',
  imports: [NgClass],
  templateUrl: './sales-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesMobileComponent extends SalesBaseDirective {}
