import { Directive, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { apiMessage } from '../../services/api-message';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class OrderDetailBaseDirective {
  private readonly catalog = inject(CatalogService);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });
  readonly ready = this.catalog.ordersReady;
  readonly order = computed(() => this.catalog.findOrder(this.id()));
  readonly canPack = computed(() => this.order()?.queue === 'pack');
  readonly canShip = computed(() => this.order()?.queue === 'ship');
  readonly canCollect = computed(() => this.order()?.queue === 'collect');
  readonly canDeliver = computed(() => this.order()?.queue === 'delivery');
  readonly tracking = signal('');
  readonly actionError = signal('');

  constructor() {
    effect(() => {
      this.id();
      untracked(() => {
        this.tracking.set('');
        this.actionError.set('');
      });
    });
  }

  setTracking(event: Event): void {
    this.tracking.set((event.target as HTMLInputElement).value);
    this.actionError.set('');
  }

  markPacked(): void {
    const order = this.order();
    if (!order) {
      return;
    }
    this.catalog.markPacked(order.id);
  }

  ship(): void {
    const order = this.order();
    const code = this.tracking().trim();
    if (!order) {
      return;
    }
    if (!code) {
      this.actionError.set('Enter a tracking number.');
      return;
    }
    this.catalog
      .ship(order.id, code)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.actionError.set(apiMessage(error));
          return of(undefined);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  complete(): void {
    const order = this.order();
    if (!order) {
      return;
    }
    this.catalog
      .complete(order.id)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.actionError.set(apiMessage(error));
          return of(undefined);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
