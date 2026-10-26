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
    { month: 'May', heightClass: 'h-[70px]', mobileClass: 'h-12' },
    { month: 'Jun', heightClass: 'h-[96px]', mobileClass: 'h-16' },
    { month: 'Jul', heightClass: 'h-[84px]', mobileClass: 'h-14' },
    { month: 'Aug', heightClass: 'h-[130px]', mobileClass: 'h-[88px]' },
    { month: 'Sep', heightClass: 'h-[112px]', mobileClass: 'h-[74px]' },
    { month: 'Oct', heightClass: 'h-[168px]', mobileClass: 'h-28' },
  ];
}
