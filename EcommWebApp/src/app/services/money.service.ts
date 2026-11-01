import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MoneyService {
  formatRands(value: number): string {
    const digits = Math.trunc(value).toString();
    const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `R ${grouped}`;
  }
}
