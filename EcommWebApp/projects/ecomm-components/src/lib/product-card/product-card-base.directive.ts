import { Directive, input } from '@angular/core';

@Directive()
export class ProductCardBaseDirective {
  readonly name = input('');
  readonly category = input('');
  readonly price = input('');
}
