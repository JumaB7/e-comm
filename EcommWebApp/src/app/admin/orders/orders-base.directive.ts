import { Directive, computed, inject } from '@angular/core';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class OrdersBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly orders = this.catalog.orders;
  readonly stats = computed(() => {
    const summary = this.catalog.summary();
    return [
      { label: 'Today', value: `${summary.today} orders` },
      { label: 'Paid today', value: summary.paidToday },
      { label: 'Awaiting payment', value: `${summary.awaiting}` },
      { label: 'Low stock', value: `${summary.lowStock} products` },
    ];
  });
  readonly mobileStats = computed(() => {
    const summary = this.catalog.summary();
    return [
      { label: 'Today', value: `${summary.today}` },
      { label: 'Paid', value: summary.paidTodayShort },
      { label: 'Waiting', value: `${summary.awaiting}` },
    ];
  });
}
