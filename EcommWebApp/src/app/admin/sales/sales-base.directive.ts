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
    { month: 'May', heightClass: 'h-16' },
    { month: 'Jun', heightClass: 'h-24' },
    { month: 'Jul', heightClass: 'h-20' },
    { month: 'Aug', heightClass: 'h-32' },
    { month: 'Sep', heightClass: 'h-28' },
    { month: 'Oct', heightClass: 'h-40' },
  ];
}
