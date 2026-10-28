import { Injectable, computed, signal } from '@angular/core';
import { Observable, defer, finalize } from 'rxjs';

const showAfterMs = 1000;

@Injectable({ providedIn: 'root' })
export class SpinnerService {
  private readonly count = signal(0);
  private readonly visible = signal(false);
  private wait: ReturnType<typeof setTimeout> | undefined;
  readonly isLoading = computed(() => this.visible());

  show(): void {
    const idle = this.count() === 0;
    this.count.update((count) => count + 1);
    if (!idle || this.visible() || this.wait !== undefined) {
      return;
    }
    this.wait = setTimeout(() => {
      this.wait = undefined;
      if (this.count() > 0) {
        this.visible.set(true);
      }
    }, showAfterMs);
  }

  hide(): void {
    this.count.update((count) => Math.max(0, count - 1));
    if (this.count() > 0) {
      return;
    }
    if (this.wait !== undefined) {
      clearTimeout(this.wait);
      this.wait = undefined;
    }
    queueMicrotask(() => {
      if (this.count() === 0) {
        this.visible.set(false);
      }
    });
  }

  pending<T>(source: Observable<T>): Observable<T> {
    return defer(() => {
      this.show();
      return source.pipe(finalize(() => this.hide()));
    });
  }
}
