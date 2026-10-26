import { Directive, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { CatalogService } from '../../services/catalog.service';

@Directive()
export class OrderDetailBaseDirective {
  private readonly catalog = inject(CatalogService);
  readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );
  readonly order = computed(() => this.catalog.findOrder(this.id()));
}
