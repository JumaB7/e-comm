import { Directive, computed, inject } from '@angular/core';
import { salesBarSteps } from '../../models/constants';
import { formatRand } from '../../models/money';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class SalesBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly stats = computed(() => {
    const sales = this.catalog.sales();
    return [
      { label: 'Total sales', value: formatRand((sales?.totalSalesCents ?? 0) / 100) },
      { label: 'Orders', value: `${sales?.orderCount ?? 0}` },
      { label: 'Profit', value: formatRand((sales?.profitCents ?? 0) / 100) },
      { label: 'This month', value: formatRand((sales?.thisMonthCents ?? 0) / 100) },
    ];
  });
  readonly bars = computed(() => {
    const months = this.catalog.sales()?.months ?? [];
    const max = Math.max(0, ...months.map((month) => month.profitCents));
    return months.map((month) => {
      const index = max === 0 ? 0 : Math.round((month.profitCents / max) * (salesBarSteps.length - 1));
      return { month: month.month, ...salesBarSteps[index] };
    });
  });
  readonly tallest = computed(() => {
    const months = this.catalog.sales()?.months ?? [];
    const top = months.reduce(
      (best, month) => (month.profitCents > best.profitCents ? month : best),
      months[0] ?? { month: 'This month', profitCents: 0 },
    );
    return top.month;
  });
}
