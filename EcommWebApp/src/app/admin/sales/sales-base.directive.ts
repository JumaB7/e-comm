import { Directive, computed, inject } from '@angular/core';
import { formatRand } from '../../models/money';
import { CatalogService } from '../../services/catalog.service';

const steps = [
  { heightClass: 'h-17.5', mobileClass: 'h-12' },
  { heightClass: 'h-21', mobileClass: 'h-14' },
  { heightClass: 'h-24', mobileClass: 'h-16' },
  { heightClass: 'h-28', mobileClass: 'h-18.5' },
  { heightClass: 'h-32.5', mobileClass: 'h-22' },
  { heightClass: 'h-42', mobileClass: 'h-28' },
];

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
      const index = max === 0 ? 0 : Math.round((month.profitCents / max) * (steps.length - 1));
      return { month: month.month, ...steps[index] };
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
