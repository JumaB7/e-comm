import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { CartLine, CartQuote, CheckoutDetails } from '../models/cart.model';
import { emptyCartQuote } from '../models/constants';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

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

type ContactField = 'email' | 'phone' | 'fullName' | 'street' | 'suburb' | 'city' | 'province' | 'postalCode';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  readonly bagChoice = signal<CartLine[]>(readBag() ?? []);
  readonly lines = computed(() => this.bagChoice());
  readonly deliveryChoice = signal<'courier' | 'collect' | null>(null);
  readonly delivery = computed<'courier' | 'collect'>(() => this.deliveryChoice() ?? 'courier');
  private readonly emailChoice = signal<string | null>(null);
  private readonly phoneChoice = signal<string | null>(null);
  private readonly nameChoice = signal<string | null>(null);
  private readonly streetChoice = signal<string | null>(null);
  private readonly suburbChoice = signal<string | null>(null);
  private readonly cityChoice = signal<string | null>(null);
  private readonly provinceChoice = signal<string | null>(null);
  private readonly postalChoice = signal<string | null>(null);
  private readonly profileLoadedFor = signal('');
  readonly email = computed(() => this.emailChoice() ?? '');
  readonly phone = computed(() => this.phoneChoice() ?? '');
  readonly fullName = computed(() => this.nameChoice() ?? '');
  readonly street = computed(() => this.streetChoice() ?? '');
  readonly suburb = computed(() => this.suburbChoice() ?? '');
  readonly city = computed(() => this.cityChoice() ?? '');
  readonly province = computed(() => this.provinceChoice() ?? '');
  readonly postalCode = computed(() => this.postalChoice() ?? '');
  readonly count = computed(() => this.lines().reduce((sum, line) => sum + line.qty, 0));
  private readonly quote = toSignal(
    toObservable(
      computed(() => ({
        delivery: this.delivery(),
        lines: this.lines().map((line) => ({ sku: line.sku, qty: line.qty, detail: line.detail })),
      })),
    ).pipe(
      switchMap((body) =>
        this.http.post<CartQuote>('/api/cart/quote', body).pipe(catchError(() => of(emptyCartQuote))),
      ),
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
        qty: line.qty,
        detail: line.detail,
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
      sessionStorage.setItem('veld-bag', JSON.stringify(this.bagChoice()));
    });
    effect(() => {
      const email = this.auth.email();
      const token = sessionStorage.getItem('veld-token');
      if (!email || !token) {
        untracked(() => {
          if (this.profileLoadedFor()) {
            this.clearContact();
          }
        });
        return;
      }
      if (this.profileLoadedFor() === email) {
        return;
      }
      untracked(() => {
        this.profileLoadedFor.set(email);
        if (!this.emailChoice()) {
          this.emailChoice.set(email);
        }
        if (!this.nameChoice() && this.auth.name()) {
          this.nameChoice.set(this.auth.name());
        }
        if (!this.phoneChoice() && this.auth.phone()) {
          this.phoneChoice.set(this.auth.phone());
        }
        this.auth.profile().subscribe((profile) => {
          if (!profile) {
            return;
          }
          if (!this.emailChoice()) {
            this.emailChoice.set(profile.email);
          }
          if (!this.nameChoice()) {
            this.nameChoice.set(profile.name);
          }
          if (!this.phoneChoice()) {
            this.phoneChoice.set(profile.phone);
          }
          if (!this.streetChoice()) {
            this.streetChoice.set(profile.street);
          }
          if (!this.suburbChoice()) {
            this.suburbChoice.set(profile.suburb);
          }
          if (!this.cityChoice()) {
            this.cityChoice.set(profile.city);
          }
          if (!this.provinceChoice()) {
            this.provinceChoice.set(profile.province);
          }
          if (!this.postalChoice()) {
            this.postalChoice.set(profile.postalCode);
          }
          if (!this.deliveryChoice()) {
            this.deliveryChoice.set(profile.delivery);
          }
        });
      });
    });
  }

  setContact(field: ContactField, value: string): void {
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

  remove(sku: string): void {
    this.bagChoice.set(this.lines().filter((line) => line.sku !== sku));
  }

  applyQuantities(updates: Record<string, number>): void {
    const next = this.lines()
      .map((line) => {
        const qty = updates[line.sku] ?? line.qty;
        return { ...line, qty: Number.isFinite(qty) ? Math.floor(qty) : line.qty };
      })
      .filter((line) => line.qty >= 1);
    this.bagChoice.set(next);
  }

  clear(): void {
    this.bagChoice.set([]);
  }

  clearContact(): void {
    this.emailChoice.set(null);
    this.phoneChoice.set(null);
    this.nameChoice.set(null);
    this.streetChoice.set(null);
    this.suburbChoice.set(null);
    this.cityChoice.set(null);
    this.provinceChoice.set(null);
    this.postalChoice.set(null);
    this.deliveryChoice.set(null);
    this.profileLoadedFor.set('');
  }
}
