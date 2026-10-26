import { Directive, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class PaidBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly receipt = this.catalog.receipt;
  readonly receiptReady = this.catalog.receiptReady;
  readonly heading = computed(() => {
    const item = this.receipt();
    if (!item) {
      return '';
    }
    return item.reference ? `Order ${item.id} is paid` : `Order ${item.id} is with PayFast`;
  });

  constructor() {
    const key = inject(ActivatedRoute).snapshot.queryParamMap.get('receipt') ?? sessionStorage.getItem('veld-receipt') ?? '';
    if (key) {
      this.catalog.loadReceipt(key);
      return;
    }
    this.catalog.receiptReady.set(true);
  }
}
