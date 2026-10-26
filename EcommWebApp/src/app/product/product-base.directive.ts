import { Directive, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class ProductBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly sku = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('sku') ?? '')),
    { initialValue: '' },
  );
  readonly product = computed(() => this.catalog.find(this.sku()));
}
