import { Injectable } from '@angular/core';
import { LOW_STOCK_HINT_MAX } from '../constants/catalog.constants';

@Injectable({ providedIn: 'root' })
export class StockAvailabilityService {
  /** Indicative cache only — checkout validate + TryReserve are authoritative. */
  isOutOfStock(stock: number): boolean {
    return stock < 1;
  }

  /** Shown when 1–5 left; omitted for higher counts so we don't over-promise. */
  lowStockHint(stock: number): string {
    if (stock < 1 || stock > LOW_STOCK_HINT_MAX) {
      return '';
    }
    return stock === 1 ? 'Only 1 left' : `Only ${stock} left`;
  }

  metaLine(sku: string, stock: number): string {
    const hint = this.lowStockHint(stock);
    if (this.isOutOfStock(stock)) {
      return `Incl. VAT · SKU ${sku}`;
    }
    if (hint) {
      return `Incl. VAT · SKU ${sku} · ${hint}`;
    }
    return `Incl. VAT · SKU ${sku}`;
  }
}
