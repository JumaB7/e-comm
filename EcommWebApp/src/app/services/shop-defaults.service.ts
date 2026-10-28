import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, shareReplay } from 'rxjs';
import { emptyShopDefaults } from '../models/constants';
import { ShopDefaults } from '../models/shop-defaults.model';

@Injectable({ providedIn: 'root' })
export class ShopDefaultsService {
  private readonly http = inject(HttpClient);
  private readonly request = this.http.get<ShopDefaults>('/api/shop/defaults').pipe(
    catchError(() => of(emptyShopDefaults)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
  readonly defaults = toSignal(this.request, { initialValue: emptyShopDefaults });
}
