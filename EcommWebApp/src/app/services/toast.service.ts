import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal('');
  private wait: ReturnType<typeof setTimeout> | undefined;

  show(message: string): void {
    this.message.set(message);
    if (this.wait !== undefined) {
      clearTimeout(this.wait);
    }
    this.wait = setTimeout(() => {
      this.wait = undefined;
      this.message.set('');
    }, 5000);
  }

  dismiss(): void {
    if (this.wait !== undefined) {
      clearTimeout(this.wait);
      this.wait = undefined;
    }
    this.message.set('');
  }
}
