import { Directive, computed, inject } from '@angular/core';
import { orderSectionDefinitions } from '../../models/constants';
import { OrderSection } from '../../models/order.model';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class OrdersBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly orders = this.catalog.orders;
  readonly alerts = computed(() => this.catalog.orders().filter((order) => order.alert));
  readonly sections = computed<OrderSection[]>(() => {
    const orders = this.catalog.orders();
    const sections: OrderSection[] = [];
    for (const section of orderSectionDefinitions) {
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
