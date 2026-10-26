import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly query = window.matchMedia('(max-width: 767px)');
  readonly isMobile = signal(this.query.matches);

  constructor() {
    this.query.addEventListener('change', (event) => this.isMobile.set(event.matches));
  }
}
