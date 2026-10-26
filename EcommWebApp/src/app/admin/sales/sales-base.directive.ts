import { Directive } from '@angular/core';

@Directive()
export class SalesBaseDirective {
  readonly stats = [
    { label: 'Total sales', value: 'R 186 400' },
    { label: 'Orders', value: '42' },
    { label: 'Profit', value: 'R 61 200' },
    { label: 'This month', value: 'R 42 180' },
  ];
  readonly bars = [
    { month: 'May', heightClass: 'h-17.5', mobileClass: 'h-12' },
    { month: 'Jun', heightClass: 'h-24', mobileClass: 'h-16' },
    { month: 'Jul', heightClass: 'h-21', mobileClass: 'h-14' },
    { month: 'Aug', heightClass: 'h-32.5', mobileClass: 'h-22' },
    { month: 'Sep', heightClass: 'h-28', mobileClass: 'h-18.5' },
    { month: 'Oct', heightClass: 'h-42', mobileClass: 'h-28' },
  ];
}
