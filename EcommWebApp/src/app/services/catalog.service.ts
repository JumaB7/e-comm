import { Injectable, computed, signal } from '@angular/core';
import { ShopOrder } from '../models/order.model';
import { Product } from '../models/product.model';

const delivery = { label: 'Delivery', value: 'Courier, 2–5 working days' };

function withStock(product: Product, stock: number): Product {
  return { ...product, stock, low: stock <= 4 };
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly search = signal('');
  readonly products = signal<Product[]>([
    {
      sku: 'VS-OPT-1042',
      name: '10×42 binoculars',
      category: 'Optics',
      price: 'R 8 450',
      amount: 8450,
      stock: 12,
      low: false,
      blurb:
        'Roof-prism glass for last light. Rubber armour, waterproof, and a strap that stays put on a stalk. Sold as a single pair.',
      specs: [
        { label: 'Magnification', value: '10×42' },
        { label: 'Weight', value: '680 g' },
        { label: 'Waterproof', value: 'Yes' },
        delivery,
      ],
    },
    {
      sku: 'VS-APP-220',
      name: 'Merino stalking shirt',
      category: 'Apparel',
      price: 'R 1 290',
      amount: 1290,
      stock: 4,
      low: true,
      blurb: 'Quiet merino for a long stalk. This listing is the medium.',
      specs: [
        { label: 'Size', value: 'M' },
        delivery,
      ],
    },
    {
      sku: 'VS-KNF-018',
      name: 'Fixed-blade skinner',
      category: 'Knives',
      price: 'R 890',
      amount: 890,
      stock: 20,
      low: false,
      blurb: 'A fixed blade for skinning in the field. Sold on its own, with a sheath.',
      specs: [
        { label: 'Blade', value: 'Fixed' },
        delivery,
      ],
    },
    {
      sku: 'VS-PCK-028',
      name: '28L daypack',
      category: 'Packs',
      price: 'R 1 750',
      amount: 1750,
      stock: 9,
      low: false,
      blurb: 'A 28 litre daypack for water, glass, and a layer.',
      specs: [
        { label: 'Volume', value: '28 L' },
        delivery,
      ],
    },
    {
      sku: 'VS-CMP-014',
      name: 'Ground blind',
      category: 'Camp',
      price: 'R 3 200',
      amount: 3200,
      stock: 2,
      low: true,
      blurb: 'A ground blind for a sitting hunt. Packs down for the courier.',
      specs: [delivery],
    },
    {
      sku: 'VS-CMP-033',
      name: 'Trail camera',
      category: 'Camp',
      price: 'R 2 150',
      amount: 2150,
      stock: 7,
      low: false,
      blurb: 'A trail camera for the fence line. Sold as a single unit.',
      specs: [delivery],
    },
    {
      sku: 'VS-LMP-014',
      name: 'Rechargeable headlamp',
      category: 'Camp',
      price: 'R 480',
      amount: 480,
      stock: 15,
      low: false,
      blurb: 'A rechargeable headlamp for camp and the walk back.',
      specs: [
        { label: 'Power', value: 'Rechargeable' },
        delivery,
      ],
    },
    {
      sku: 'VS-APP-310',
      name: 'Stalking boots',
      category: 'Apparel',
      price: 'R 2 890',
      amount: 2890,
      stock: 6,
      low: false,
      blurb: 'Boots for a dry stalk. Sold as a pair.',
      specs: [delivery],
    },
  ]);

  readonly orders = signal<ShopOrder[]>([
    {
      id: 'VS-1048',
      customer: 'Thabo Mokoena',
      email: 'thabo@example.co.za',
      phone: '082 555 0142',
      address: '14 Kloof Road, Parktown, Johannesburg, 2193',
      total: 'R 9 860',
      status: 'Paid',
      tone: 'paid',
      fulfilment: 'To pack',
      fulfilmentNote: 'Paid, not yet packed.',
      reference: 'pf_184920',
      paidDetail: 'R 9 860 · card · 26 Oct 2026, 14:12',
      paymentNote: 'Marked paid only because the PayFast signature matched.',
      lines: ['10×42 binoculars · 1 · R 8 450', 'Merino stalking shirt · M · R 1 290', 'Courier · R 120'],
    },
    {
      id: 'VS-1047',
      customer: 'A. Naidoo',
      email: 'a.naidoo@example.co.za',
      phone: '083 555 0190',
      address: '8 Marine Parade, Durban, 4001',
      total: 'R 1 290',
      status: 'Awaiting payment',
      tone: 'awaiting',
      fulfilment: 'Waiting',
      fulfilmentNote: 'Waiting on payment.',
      reference: '',
      paidDetail: 'R 1 290 · not paid yet',
      paymentNote: 'Paid only after the PayFast signature matches.',
      lines: ['Merino stalking shirt · M · R 1 290'],
    },
    {
      id: 'VS-1046',
      customer: 'J. van Wyk',
      email: 'j.vanwyk@example.co.za',
      phone: '072 555 0144',
      address: '22 Church Street, Stellenbosch, 7600',
      total: 'R 3 200',
      status: 'Packed',
      tone: 'packed',
      fulfilment: 'To ship',
      fulfilmentNote: 'Packed, ready to ship.',
      reference: 'pf_184700',
      paidDetail: 'R 3 200 · card · 25 Oct 2026, 16:02',
      paymentNote: 'Marked paid only because the PayFast signature matched.',
      lines: ['Ground blind · 1 · R 3 200'],
    },
    {
      id: 'VS-1045',
      customer: 'L. Dlamini',
      email: 'l.dlamini@example.co.za',
      phone: '071 555 0188',
      address: '4 Oxford Road, Rosebank, Johannesburg, 2196',
      total: 'R 890',
      status: 'Paid',
      tone: 'paid',
      fulfilment: 'Shipped',
      fulfilmentNote: 'Shipped.',
      reference: 'pf_184640',
      paidDetail: 'R 890 · card · 25 Oct 2026, 09:15',
      paymentNote: 'Marked paid only because the PayFast signature matched.',
      lines: ['Fixed-blade skinner · 1 · R 890'],
    },
    {
      id: 'VS-1044',
      customer: 'S. Botha',
      email: 's.botha@example.co.za',
      phone: '082 555 0110',
      address: '19 Reid Street, Westdene, Bloemfontein, 9301',
      total: 'R 2 150',
      status: 'Paid',
      tone: 'paid',
      fulfilment: 'To pack',
      fulfilmentNote: 'Paid, not yet packed.',
      reference: 'pf_184510',
      paidDetail: 'R 2 150 · card · 24 Oct 2026, 11:40',
      paymentNote: 'Marked paid only because the PayFast signature matched.',
      lines: ['Trail camera · 1 · R 2 150'],
    },
  ]);

  readonly featured = computed(() => this.products().slice(0, 4));

  find(sku: string): Product | undefined {
    return this.products().find((product) => product.sku === sku);
  }

  findOrder(id: string): ShopOrder | undefined {
    return this.orders().find((order) => order.id === id);
  }

  adjustStock(name: string, quantity: number, direction: 1 | -1): void {
    if (quantity < 1) {
      return;
    }
    this.products.update((products) =>
      products.map((product) => {
        if (product.name.toLowerCase() !== name.trim().toLowerCase()) {
          return product;
        }
        return withStock(product, Math.max(0, product.stock + direction * quantity));
      }),
    );
  }

  removeProduct(sku: string): void {
    this.products.update((products) => products.filter((product) => product.sku !== sku));
  }

  addProduct(product: Product): void {
    if (this.find(product.sku)) {
      return;
    }
    this.products.update((products) => [...products, withStock(product, product.stock)]);
  }

  markPacked(id: string): void {
    this.orders.update((orders) =>
      orders.map((order) =>
        order.id === id && order.fulfilment === 'To pack'
          ? { ...order, fulfilment: 'Packed', fulfilmentNote: 'Packed. Payment is unchanged.' }
          : order,
      ),
    );
  }
}
