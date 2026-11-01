import { Injectable } from '@angular/core';
import { ProgressStep, ShopOrder } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderProgressService {
  steps(order: ShopOrder | null): ProgressStep[] {
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
}
