import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { CartLine, CartQuote, CheckoutDetails } from '../models/cart.model';
import { emptyCartQuote } from '../models/constants';
import { Product } from '../models/product.model';
import { ShopDefaultsService } from './shop-defaults.service';

function readBag(): CartLine[] | null {
  try {
    const raw = sessionStorage.getItem('veld-bag');
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly shop = inject(ShopDefaultsService);
  readonly bagChoice = signal<CartLine[] | null>(readBag());
  readonly lines = computed(() => this.bagChoice() ?? this.shop.defaults().bag);
  readonly deliveryChoice = signal<'courier' | 'collect' | null>(null);
  readonly delivery = computed<'courier' | 'collect'>(() => {
    const chosen = this.deliveryChoice();
    if (chosen) {
      return chosen;
    }
    return this.shop.defaults().delivery === 'collect' ? 'collect' : 'courier';
  });
  private readonly emailChoice = signal<string | null>(null);
  private readonly phoneChoice = signal<string | null>(null);
  private readonly nameChoice = signal<string | null>(null);
  private readonly streetChoice = signal<string | null>(null);
  private readonly suburbChoice = signal<string | null>(null);
  private readonly cityChoice = signal<string | null>(null);
  private readonly provinceChoice = signal<string | null>(null);
  private readonly postalChoice = signal<string | null>(null);
  readonly email = computed(() => this.emailChoice() ?? this.shop.defaults().customerEmail);
  readonly phone = computed(() => this.phoneChoice() ?? this.shop.defaults().phone);
  readonly fullName = computed(() => this.nameChoice() ?? this.shop.defaults().name);
  readonly street = computed(() => this.streetChoice() ?? this.shop.defaults().street);
  readonly suburb = computed(() => this.suburbChoice() ?? this.shop.defaults().suburb);
  readonly city = computed(() => this.cityChoice() ?? this.shop.defaults().city);
  readonly province = computed(() => this.provinceChoice() ?? this.shop.defaults().province);
  readonly postalCode = computed(() => this.postalChoice() ?? this.shop.defaults().postalCode);
  readonly count = computed(() => this.lines().reduce((sum, line) => sum + line.qty, 0));
  private readonly quote = toSignal(
    toObservable(
      computed(() => ({
        delivery: this.delivery(),
        lines: this.lines().map((line) => ({ sku: line.sku, qty: line.qty, detail: line.detail })),
      })),
    ).pipe(
      switchMap((body) => this.http.post<CartQuote>('/api/cart/quote', body).pipe(catchError(() => of(emptyCartQuote)))),
    ),
    { initialValue: emptyCartQuote },
  );
  readonly subtotalLabel = computed(() => this.quote().subtotal);
  readonly courierLabel = computed(() => this.quote().courier);
  readonly courierFeeLabel = computed(() => this.quote().courierFee);
  readonly totalLabel = computed(() => this.quote().total);
  readonly deliveryNote = computed(() =>
    this.delivery() === 'courier'
      ? `Courier to ${this.street()}, ${this.suburb()}. 2–5 working days.`
      : 'Collect from the shop. We will email when it is packed.',
  );
  readonly displayLines = computed(() => {
    const quoted = new Map(this.quote().lines.map((line) => [line.sku, line]));
    return this.lines().map((line) => {
      const match = quoted.get(line.sku);
      return {
        sku: line.sku,
        name: match?.name || line.name,
        priceLabel: match?.price ?? '',
        qtyLabel: line.detail ? `Qty ${line.qty} · ${line.detail}` : `Qty ${line.qty}`,
      };
    });
  });
  readonly checkout = computed<CheckoutDetails>(() => ({
    email: this.email(),
    phone: this.phone(),
    name: this.fullName(),
    street: this.street(),
    suburb: this.suburb(),
    city: this.city(),
    province: this.province(),
    postalCode: this.postalCode(),
    delivery: this.delivery(),
    method: 'card',
    lines: this.lines().map((line) => ({ sku: line.sku, qty: line.qty, detail: line.detail })),
  }));

  constructor() {
    effect(() => {
      const bag = this.bagChoice();
      if (bag === null) {
        return;
      }
      sessionStorage.setItem('veld-bag', JSON.stringify(bag));
    });
  }

  setContact(
    field: 'email' | 'phone' | 'fullName' | 'street' | 'suburb' | 'city' | 'province' | 'postalCode',
    value: string,
  ): void {
    if (field === 'email') {
      this.emailChoice.set(value);
    } else if (field === 'phone') {
      this.phoneChoice.set(value);
    } else if (field === 'fullName') {
      this.nameChoice.set(value);
    } else if (field === 'street') {
      this.streetChoice.set(value);
    } else if (field === 'suburb') {
      this.suburbChoice.set(value);
    } else if (field === 'city') {
      this.cityChoice.set(value);
    } else if (field === 'province') {
      this.provinceChoice.set(value);
    } else {
      this.postalChoice.set(value);
    }
  }

  add(product: Product, qty: number, detail = ''): void {
    if (qty < 1) {
      return;
    }
    const lines = this.lines();
    const existing = lines.find((line) => line.sku === product.sku);
    const next = !existing
      ? [...lines, { sku: product.sku, name: product.name, qty, detail }]
      : lines.map((line) => (line.sku === product.sku ? { ...line, qty: line.qty + qty } : line));
    this.bagChoice.set(next);
  }

  clear(): void {
    this.bagChoice.set([]);
  }
}
