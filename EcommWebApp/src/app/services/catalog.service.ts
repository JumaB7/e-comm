import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, switchMap, throwError } from 'rxjs';
import { CheckoutDetails } from '../models/cart.model';
import { emptyOrderSummary } from '../models/constants';
import { CheckoutResponse, OrderSummary, ShopOrder } from '../models/order.model';
import { Product } from '../models/product.model';
import { SalesReport } from '../models/sales.model';
import { apiMessage } from './auth.interceptor';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  readonly search = signal('');
  readonly products = signal<Product[]>([]);
  readonly featured = computed(() => this.products().slice(0, 4));
  readonly ready = signal(false);
  readonly orders = signal<ShopOrder[]>([]);
  readonly ordersReady = signal(false);
  readonly summary = signal<OrderSummary>(emptyOrderSummary);
  readonly sales = signal<SalesReport | null>(null);
  readonly receipt = signal<ShopOrder | null>(null);
  readonly receiptReady = signal(false);

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.http
      .get<Product[]>('/api/products')
      .pipe(catchError(() => of([] as Product[])))
      .subscribe((products) => {
        this.products.set(products);
        this.ready.set(true);
      });
  }

  loadAdmin(): void {
    this.http
      .get<ShopOrder[]>('/api/admin/orders')
      .pipe(catchError(() => of([] as ShopOrder[])))
      .subscribe((orders) => {
        this.orders.set(orders);
        this.ordersReady.set(true);
      });
    this.http
      .get<OrderSummary>('/api/admin/orders/summary')
      .pipe(catchError(() => of(emptyOrderSummary)))
      .subscribe((summary) => this.summary.set(summary));
    this.http
      .get<SalesReport>('/api/admin/sales')
      .pipe(catchError(() => of(null)))
      .subscribe((sales) => this.sales.set(sales));
  }

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
    this.http
      .post<Product>('/api/admin/stock', { name, quantity, direction })
      .pipe(catchError(() => of(undefined)))
      .subscribe((product) => {
        if (!product) {
          return;
        }
        this.products.update((products) => products.map((item) => (item.sku === product.sku ? product : item)));
        this.loadAdmin();
      });
  }

  removeProduct(sku: string): void {
    this.http.delete(`/api/admin/products/${sku}`).subscribe({
      next: () => this.products.update((products) => products.filter((product) => product.sku !== sku)),
    });
  }

  addProduct(product: { name: string; sku: string; category: string; priceRands: number; stock: number }): void {
    this.http
      .post<Product>('/api/admin/products', product)
      .pipe(catchError(() => of(undefined)))
      .subscribe((saved) => {
        if (!saved || this.find(saved.sku)) {
          return;
        }
        this.products.update((products) => [...products, saved]);
      });
  }

  markPacked(id: string): void {
    this.http
      .post<ShopOrder>(`/api/admin/orders/${id}/pack`, {})
      .pipe(catchError(() => of(undefined)))
      .subscribe((order) => {
        if (!order) {
          return;
        }
        this.orders.update((orders) => orders.map((item) => (item.id === order.id ? order : item)));
      });
  }

  pay(details: CheckoutDetails): Observable<ShopOrder | null> {
    return this.http.post<CheckoutResponse>('/api/orders', details).pipe(
      switchMap((result) => {
        sessionStorage.setItem('veld-receipt', result.receiptKey);
        if (result.mode === 'payfast' && result.payFastUrl && result.fields) {
          submitPayFast(result.payFastUrl, result.fields);
          return of(null);
        }
        return this.http.post<ShopOrder>(`/api/payfast/local/${result.order.id}`, {});
      }),
      catchError((error: HttpErrorResponse) => throwError(() => new Error(apiMessage(error)))),
    );
  }

  loadReceipt(key: string): void {
    this.receiptReady.set(false);
    this.http
      .get<ShopOrder>(`/api/orders/receipt/${key}`)
      .pipe(catchError(() => of(null)))
      .subscribe((order) => {
        this.receipt.set(order);
        this.receiptReady.set(true);
      });
  }
}

function submitPayFast(url: string, fields: Record<string, string>): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
