import { Directive, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ShopOrder } from '../../models/order.model';
import { CatalogService } from '../../services/catalog.service';

interface ProgressStep {
  label: string;
  done: boolean;
  current: boolean;
}

@Directive()
export class AccountOrderBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });
  readonly order = this.catalog.myOrder;
  readonly ready = this.catalog.myOrderReady;
  readonly steps = computed(() => progressSteps(this.order()));

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

function progressSteps(order: ShopOrder | null): ProgressStep[] {
  if (!order) {
    return [];
  }
  const collect = order.delivery === 'collect';
  const labels = collect
    ? ['Paid', 'Packed', 'Ready to collect', 'Collected']
    : ['Paid', 'Packed', 'Shipped', 'Delivered'];
  const active =
    order.queue === 'waiting' ? 0 :
    order.queue === 'pack' ? 1 :
    order.queue === 'ship' || order.queue === 'collect' ? 2 :
    order.queue === 'delivery' ? 3 :
    order.queue === 'done' ? 4 :
    0;
  return labels.map((label, step) => ({
    label,
    done: active > step,
    current: active === step || (active === 4 && step === 3),
  }));
}
