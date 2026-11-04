import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { errorPageFor } from '../constants/error-pages.constants';

export class ErrorBase {
  private readonly route = inject(ActivatedRoute);

  readonly codeParam = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('code') ?? '404')),
    { initialValue: '404' },
  );

  readonly page = computed(() => errorPageFor(this.codeParam()));
}
