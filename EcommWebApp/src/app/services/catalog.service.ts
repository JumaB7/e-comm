import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, Subscription, catchError, of, switchMap, tap, throwError } from 'rxjs';
import { CheckoutDetails } from '../models/cart.model';
import { emptyOrderSummary } from '../models/constants';
import { CheckoutResponse, OrderSummary, ShopOrder } from '../models/order.model';
import { Product, ProductWrite } from '../models/product.model';
import { SalesReport } from '../models/sales.model';
import { apiMessage } from './api-message';
import { SessionStoreService } from './session-store.service';
import { SpinnerService } from './spinner.service';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly spinner = inject(SpinnerService);
  private readonly session = inject(SessionStoreService);
  readonly search = signal('');
  readonly products = signal<Product[]>([]);
  readonly featured = computed(() => this.products().slice(0, 4));
  readonly ready = signal(false);
  readonly orders = signal<ShopOrder[]>([]);
  readonly ordersReady = signal(false);
  readonly myOrders = signal<ShopOrder[]>([]);
  readonly myOrdersReady = signal(false);
  readonly myOrder = signal<ShopOrder | null>(null);
  readonly myOrderReady = signal(false);
  readonly summary = signal<OrderSummary>(emptyOrderSummary);
  readonly sales = signal<SalesReport | null>(null);
  readonly receipt = signal<ShopOrder | null>(null);
  readonly receiptReady = signal(false);

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.spinner
      .pending(this.http.get<Product[]>('/api/products').pipe(catchError(() => of([] as Product[]))))
      .subscribe((products) => {
        this.products.set(products);
        this.ready.set(true);
      });
  }

  loadAdmin(): void {
    this.spinner
      .pending(this.http.get<ShopOrder[]>('/api/admin/orders').pipe(catchError(() => of([] as ShopOrder[]))))
      .subscribe((orders) => {
        this.orders.set(orders);
        this.ordersReady.set(true);
      });
    this.spinner
      .pending(this.http.get<OrderSummary>('/api/admin/orders/summary').pipe(catchError(() => of(emptyOrderSummary))))
      .subscribe((summary) => this.summary.set(summary));
    this.spinner
      .pending(this.http.get<SalesReport>('/api/admin/sales').pipe(catchError(() => of(null))))
      .subscribe((sales) => this.sales.set(sales));
  }

  find(sku: string): Product | undefined {
    return this.products().find((product) => product.sku === sku);
  }

  findOrder(id: string): ShopOrder | undefined {
    return this.orders().find((order) => order.id === id);
  }

  adjustStock(name: string, quantity: number, direction: 1 | -1): Subscription {
    if (quantity < 1) {
      return new Subscription();
    }
    return this.spinner
      .pending(this.http.post<Product>('/api/admin/stock', { name, quantity, direction }).pipe(catchError(() => of(undefined))))
      .subscribe((product) => {
        if (!product) {
          return;
        }
        this.products.update((products) => products.map((item) => (item.sku === product.sku ? product : item)));
        this.loadAdmin();
      });
  }

  removeProduct(sku: string): void {
    this.spinner.pending(this.http.delete(`/api/admin/products/${sku}`), { immediate: true }).subscribe({
      next: () => this.products.update((products) => products.filter((product) => product.sku !== sku)),
    });
  }

  addProduct(product: ProductWrite): Observable<Product> {
    return this.spinner.pending(this.http.post<Product>('/api/admin/products', product), { immediate: true }).pipe(
      tap((saved) => {
        if (!this.find(saved.sku)) {
          this.products.update((products) => [...products, saved]);
        }
      }),
    );
  }

  updateProduct(sku: string, product: ProductWrite): Observable<Product> {
    return this.spinner
      .pending(this.http.put<Product>(`/api/admin/products/${encodeURIComponent(sku)}`, product), { immediate: true })
      .pipe(
        tap((saved) => {
          this.products.update((products) => products.map((item) => (item.sku === sku ? saved : item)));
        }),
      );
  }

  uploadProductImage(sku: string, file: File): Observable<Product> {
    const body = new FormData();
    body.append('file', file);
    return this.spinner
      .pending(this.http.post<Product>(`/api/admin/products/${encodeURIComponent(sku)}/image`, body), {
        immediate: true,
      })
      .pipe(
        tap((saved) => {
          this.products.update((products) => products.map((item) => (item.sku === saved.sku ? saved : item)));
        }),
      );
  }

  markPacked(id: string): void {
    this.spinner
      .pending(this.http.post<ShopOrder>(`/api/admin/orders/${id}/pack`, {}).pipe(catchError(() => of(undefined))), {
        immediate: true,
      })
      .subscribe((order) => {
        if (!order) {
          return;
        }
        this.replaceOrder(order);
      });
  }

  ship(id: string, tracking: string): Observable<ShopOrder> {
    return this.spinner
      .pending(this.http.post<ShopOrder>(`/api/admin/orders/${encodeURIComponent(id)}/ship`, { tracking }), {
        immediate: true,
      })
      .pipe(tap((order) => this.replaceOrder(order)));
  }

  complete(id: string): Observable<ShopOrder> {
    return this.spinner
      .pending(this.http.post<ShopOrder>(`/api/admin/orders/${encodeURIComponent(id)}/complete`, {}), {
        immediate: true,
      })
      .pipe(tap((order) => this.replaceOrder(order)));
  }

  pay(details: CheckoutDetails): Observable<ShopOrder | null> {
    return this.spinner.pending(
      this.http.post<CheckoutResponse>('/api/orders', details).pipe(
        switchMap((result) => {
          this.session.setReceipt(result.receiptKey);
          if (result.mode === 'payfast' && result.payFastUrl && result.fields) {
            this.submitPayFast(result.payFastUrl, result.fields);
            return of(null);
          }
          return this.http.post<ShopOrder>(`/api/payfast/local/${result.order.id}`, {});
        }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(apiMessage(error)))),
      ),
      { immediate: true },
    );
  }

  loadReceipt(key: string): void {
    this.receiptReady.set(false);
    this.spinner
      .pending(this.http.get<ShopOrder>(`/api/orders/receipt/${key}`).pipe(catchError(() => of(null))))
      .subscribe((order) => {
        this.receipt.set(order);
        this.receiptReady.set(true);
      });
  }

  loadMyOrders(): void {
    this.myOrdersReady.set(false);
    this.spinner
      .pending(this.http.get<ShopOrder[]>('/api/orders/mine').pipe(catchError(() => of([] as ShopOrder[]))))
      .subscribe((orders) => {
        this.myOrders.set(orders);
        this.myOrdersReady.set(true);
      });
  }

  loadMyOrder(number: string): void {
    this.myOrderReady.set(false);
    this.myOrder.set(null);
    this.spinner
      .pending(
        this.http.get<ShopOrder>(`/api/orders/mine/${encodeURIComponent(number)}`).pipe(catchError(() => of(null))),
      )
      .subscribe((order) => {
        this.myOrder.set(order);
        this.myOrderReady.set(true);
      });
  }

  private replaceOrder(order: ShopOrder): void {
    this.orders.update((orders) => orders.map((item) => (item.id === order.id ? order : item)));
  }

  private submitPayFast(url: string, fields: Record<string, string>): void {
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
}
