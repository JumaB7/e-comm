import { Injectable, computed, signal } from '@angular/core';
import { ShopOrder } from '../models/order.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly products = signal<Product[]>([
    { sku: 'VS-OPT-1042', name: '10×42 binoculars', category: 'Optics', price: 'R 8 450', stock: 12, low: false },
    { sku: 'VS-APP-220', name: 'Merino stalking shirt', category: 'Apparel', price: 'R 1 290', stock: 4, low: true },
    { sku: 'VS-KNF-018', name: 'Fixed-blade skinner', category: 'Knives', price: 'R 890', stock: 20, low: false },
    { sku: 'VS-PCK-028', name: '28L daypack', category: 'Packs', price: 'R 1 750', stock: 9, low: false },
    { sku: 'VS-CMP-014', name: 'Ground blind', category: 'Camp', price: 'R 3 200', stock: 2, low: true },
    { sku: 'VS-CMP-033', name: 'Trail camera', category: 'Camp', price: 'R 2 150', stock: 7, low: false },
    { sku: 'VS-LMP-014', name: 'Rechargeable headlamp', category: 'Camp', price: 'R 480', stock: 15, low: false },
    { sku: 'VS-APP-310', name: 'Stalking boots', category: 'Apparel', price: 'R 2 890', stock: 6, low: false },
  ]);

  readonly orders = signal<ShopOrder[]>([
    { id: 'VS-1048', customer: 'Thabo Mokoena', email: 'thabo@example.co.za', total: 'R 9 860', status: 'Paid', tone: 'paid', when: '26 Oct 2026 14:12', reference: 'pf_184920' },
    { id: 'VS-1047', customer: 'Ayesha Khan', email: 'ayesha@example.co.za', total: 'R 1 290', status: 'Packed', tone: 'packed', when: '26 Oct 2026 11:04', reference: 'pf_184811' },
    { id: 'VS-1046', customer: 'Johan Pietersen', email: 'johan@example.co.za', total: 'R 3 200', status: 'Awaiting payment', tone: 'awaiting', when: '25 Oct 2026 18:40', reference: '' },
    { id: 'VS-1044', customer: 'Lerato Dlamini', email: 'lerato@example.co.za', total: 'R 890', status: 'Paid', tone: 'paid', when: '25 Oct 2026 09:15', reference: 'pf_184640' },
  ]);

  readonly featured = computed(() => this.products().slice(0, 4));

  find(sku: string): Product | undefined {
    return this.products().find((product) => product.sku === sku);
  }

  findOrder(id: string): ShopOrder | undefined {
    return this.orders().find((order) => order.id === id);
  }
}
