import { Directive, computed, inject } from '@angular/core';
import { ShopOrder } from '../../models/order.model';
import { CatalogService } from '../../services/catalog.service';

interface OrderSection {
  queue: string;
  title: string;
  detail: string;
  orders: ShopOrder[];
}

@Directive()
export class OrdersBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly orders = this.catalog.orders;
  readonly alerts = computed(() => this.catalog.orders().filter((order) => order.alert));
  readonly sections = computed<OrderSection[]>(() => {
    const orders = this.catalog.orders();
    const defined = [
      { queue: 'pack', title: 'To pack', detail: 'Paid orders that still need packing.', always: true },
      { queue: 'ship', title: 'To ship', detail: 'Packed. Open the order to add a tracking number.', always: true },
      { queue: 'collect', title: 'To collect', detail: 'Packed and waiting for the customer at the shop.', always: true },
      { queue: 'delivery', title: 'Out for delivery', detail: 'Shipped. Mark delivered once it arrives.', always: true },
      { queue: 'waiting', title: 'Awaiting payment', detail: 'Not paid yet.', always: false },
      { queue: 'done', title: 'Completed', detail: 'Delivered or collected.', always: false },
    ];
    const sections: OrderSection[] = [];
    for (const section of defined) {
      const rows = orders.filter((order) => (order.queue || 'waiting') === section.queue);
      if (section.always || rows.length > 0) {
        sections.push({ queue: section.queue, title: section.title, detail: section.detail, orders: rows });
      }
    }
    return sections;
  });
  readonly stats = computed(() => {
    const summary = this.catalog.summary();
    return [
      { label: 'Today', value: `${summary.today} orders` },
      { label: 'Paid today', value: summary.paidToday },
      { label: 'Awaiting payment', value: `${summary.awaiting}` },
      { label: 'Needs attention', value: `${this.alerts().length}` },
    ];
  });
  readonly mobileStats = computed(() => {
    const summary = this.catalog.summary();
    return [
      { label: 'Today', value: `${summary.today}` },
      { label: 'Paid', value: summary.paidTodayShort },
      { label: 'Attention', value: `${this.alerts().length}` },
    ];
  });
}
