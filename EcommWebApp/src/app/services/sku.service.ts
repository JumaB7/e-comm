import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { skuPrefixes } from '../models/constants';

@Injectable({ providedIn: 'root' })
export class SkuService {
  prefix(category: string): string {
    return skuPrefixes[category] ?? skuPrefixes['Optics'];
  }

  prefixes(): string[] {
    return Object.values(skuPrefixes);
  }

  completeSku(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '').trim();
    const original = String(control.parent?.get('originalSku')?.value ?? '').trim();
    if (original && value === original) {
      return null;
    }
    const category = String(control.parent?.get('category')?.value ?? 'Optics');
    const prefix = this.prefix(category);
    if (!value.startsWith(prefix)) {
      return { prefix: true };
    }
    return value.length > prefix.length && !value.endsWith('-') ? null : { sku: true };
  }
}
