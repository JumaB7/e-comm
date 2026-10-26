import { Directive, computed, inject } from '@angular/core';
import { formatRand } from '../../models/money';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class OrdersBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly orders = this.catalog.orders;
  readonly stats = computed(() => {
    const summary = this.catalog.summary();
    return [
      { label: 'Today', value: `${summary.today} orders` },
      { label: 'Paid today', value: formatRand(summary.paidTodayCents / 100) },
      { label: 'Awaiting payment', value: `${summary.awaiting}` },
      { label: 'Low stock', value: `${summary.lowStock} products` },
    ];
  });
  readonly mobileStats = computed(() => {
    const summary = this.catalog.summary();
    const rands = Math.round(summary.paidTodayCents / 100);
    const paid = rands >= 1000 ? `R ${Math.round(rands / 1000)}k` : formatRand(rands);
    return [
      { label: 'Today', value: `${summary.today}` },
      { label: 'Paid', value: paid },
      { label: 'Waiting', value: `${summary.awaiting}` },
    ];
  });
}
