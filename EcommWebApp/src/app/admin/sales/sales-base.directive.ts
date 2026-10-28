import { Directive, computed, inject } from '@angular/core';
import { SalesCategory, SalesMonthPoint } from '../../models/sales.model';
import { CatalogService } from '../../services/catalog.service';

const emptyDelta = { text: 'No change', up: false, flat: true };

@Directive()
export class SalesBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly report = computed(() => this.catalog.sales());
  readonly period = computed(() => this.report()?.period ?? '');
  readonly stats = computed(() =>
    (this.report()?.stats ?? []).map((stat) => ({
      ...stat,
      tone: stat.change.flat ? 'text-muted' : stat.change.up ? 'text-success' : 'text-danger',
      mark: stat.change.flat ? '→' : stat.change.up ? '↗' : '↘',
    })),
  );
  readonly months = computed<SalesMonthPoint[]>(() => this.report()?.months ?? []);
  readonly categories = computed<SalesCategory[]>(() => this.report()?.categories ?? []);
  readonly profitTotal = computed(() => this.report()?.profitTotal ?? 'R 0');
  readonly profitNote = computed(() => this.report()?.profitNote ?? '');
  readonly margin = computed(() => this.report()?.margin ?? '0.0%');
  readonly marginNote = computed(() => this.report()?.marginNote ?? '');
  readonly marginHealthy = computed(() => this.report()?.marginHealthy ?? false);
  readonly grossProfit = computed(() => this.report()?.grossProfit ?? 'R 0');
  readonly productCosts = computed(() => this.report()?.productCosts ?? 'R 0');
  readonly repeatShare = computed(() => this.report()?.repeatShare ?? '0%');
  readonly repeatChange = computed(() => {
    const change = this.report()?.repeatChange ?? emptyDelta;
    return {
      ...change,
      tone: change.flat ? 'text-muted' : change.up ? 'text-success' : 'text-danger',
      mark: change.flat ? '' : change.up ? '+' : '−',
    };
  });
  readonly blocks = computed(() => Array.from({ length: 10 }, (_, index) => index < (this.report()?.repeatFilled ?? 0)));
  readonly newCustomers = computed(() => this.report()?.newCustomers ?? 0);
  readonly returningCustomers = computed(() => this.report()?.returningCustomers ?? 0);
  readonly refundRate = computed(() => this.report()?.refundRate ?? '0%');
}
