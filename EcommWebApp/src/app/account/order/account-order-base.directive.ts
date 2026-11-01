import { Directive, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { CatalogService } from '../../services/catalog.service';
import { OrderProgressService } from '../../services/order-progress.service';

@Directive()
export class AccountOrderBaseDirective {
  private readonly catalog = inject(CatalogService);
  private readonly progress = inject(OrderProgressService);
  readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });
  readonly order = this.catalog.myOrder;
  readonly ready = this.catalog.myOrderReady;
  readonly steps = computed(() => this.progress.steps(this.order()));

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        if (id) {
          this.catalog.loadMyOrder(id);
        }
      });
    });
  }
}
