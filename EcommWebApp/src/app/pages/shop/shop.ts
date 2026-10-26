import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface Product {
  name: string;
  price: string;
  sku: string;
}

@Component({
  selector: 'app-shop',
  templateUrl: './shop.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopPage {
  protected readonly products = signal<Product[]>([
    { name: '10×42 binoculars', price: 'R 8 450', sku: 'VS-OPT-1042' },
    { name: 'Merino stalking shirt', price: 'R 1 290', sku: 'VS-APP-220' },
    { name: 'Fixed-blade skinner', price: 'R 890', sku: 'VS-KNF-018' },
    { name: '28L daypack', price: 'R 1 750', sku: 'VS-PCK-028' },
  ]);
}
