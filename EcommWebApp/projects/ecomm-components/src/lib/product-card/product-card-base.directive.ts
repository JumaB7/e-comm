import { computed, Directive, input } from '@angular/core';

@Directive()
export class ProductCardBaseDirective {
  readonly name = input('');
  readonly category = input('');
  readonly price = input('');
  readonly sku = input('');
  readonly image = input('');
  readonly photo = computed(() => this.image());
}
