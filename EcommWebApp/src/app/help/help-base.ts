import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { helpPages, isHelpPageSlug } from './help-pages';

export class HelpBase {
  readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('page') ?? '')),
    { initialValue: '' },
  );

  readonly page = computed(() => {
    const slug = this.slug();
    return isHelpPageSlug(slug) ? helpPages[slug] : undefined;
  });
}
