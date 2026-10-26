import { Directive, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class ShopShellBaseDirective {
  private readonly cart = inject(CartService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  readonly bagCount = this.cart.count;
  readonly search = this.catalog.search;
  readonly links = [
    { label: 'Shop', path: '/shop', category: '' },
    { label: 'Optics', path: '/shop', category: 'Optics' },
    { label: 'Apparel', path: '/shop', category: 'Apparel' },
    { label: 'Camp', path: '/shop', category: 'Camp' },
    { label: 'Knives', path: '/shop', category: 'Knives' },
  ];
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  readonly showSearch = computed(() => {
    const path = this.url().split('?')[0];
    return path === '/' || path.startsWith('/shop');
  });
  readonly activeLabel = computed(() => {
    const path = this.url().split('?')[0];
    if (path !== '/shop') {
      return '';
    }
    return this.router.parseUrl(this.url()).queryParams['category'] ?? 'Shop';
  });

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    if (value && !this.router.url.startsWith('/shop')) {
      void this.router.navigate(['/shop']);
    }
  }
}
