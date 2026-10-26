import { Injectable, computed, signal } from '@angular/core';
import { formatRand } from '../models/money';
import { Product } from '../models/product.model';

export interface CartLine {
  sku: string;
  name: string;
  amount: number;
  qty: number;
  detail: string;
}

const courierFee = 120;

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly lines = signal<CartLine[]>([
    { sku: 'VS-OPT-1042', name: '10×42 binoculars', amount: 8450, qty: 1, detail: '' },
    { sku: 'VS-APP-220', name: 'Merino stalking shirt', amount: 1290, qty: 1, detail: 'M' },
  ]);
  readonly delivery = signal<'courier' | 'collect'>('courier');
  readonly count = computed(() => this.lines().reduce((sum, line) => sum + line.qty, 0));
  readonly subtotal = computed(() => this.lines().reduce((sum, line) => sum + line.amount * line.qty, 0));
  readonly courier = computed(() => (this.delivery() === 'courier' ? courierFee : 0));
  readonly total = computed(() => this.subtotal() + this.courier());
  readonly subtotalLabel = computed(() => formatRand(this.subtotal()));
  readonly courierLabel = computed(() => formatRand(this.courier()));
  readonly totalLabel = computed(() => formatRand(this.total()));
  readonly deliveryNote = computed(() =>
    this.delivery() === 'courier'
      ? 'Courier to 14 Kloof Road, Parktown. 2–5 working days.'
      : 'Collect from the shop. We will email when it is packed.',
  );
  readonly displayLines = computed(() =>
    this.lines().map((line) => ({
      sku: line.sku,
      name: line.name,
      priceLabel: formatRand(line.amount * line.qty),
      qtyLabel: line.detail ? `Qty ${line.qty} · ${line.detail}` : `Qty ${line.qty}`,
    })),
  );

  add(product: Product, qty: number, detail = ''): void {
    if (qty < 1) {
      return;
    }
    this.lines.update((lines) => {
      const existing = lines.find((line) => line.sku === product.sku);
      if (!existing) {
        return [...lines, { sku: product.sku, name: product.name, amount: product.amount, qty, detail }];
      }
      return lines.map((line) => (line.sku === product.sku ? { ...line, qty: line.qty + qty } : line));
    });
  }
}
