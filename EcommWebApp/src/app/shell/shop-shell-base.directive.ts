import { Directive, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';

@Directive()
export class ShopShellBaseDirective {
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  /** Same pattern as AO: getUserData() → toSignal at the consumer. */
  readonly userData = toSignal(this.auth.getUserData(), { initialValue: undefined });
  readonly bagCount = this.cart.count;
  readonly search = this.catalog.search;
  readonly links = computed(() => {
    const signedIn = !!this.userData();
    return [
      { label: 'Home', path: '/' },
      { label: 'Shop', path: '/shop' },
      signedIn
        ? { label: 'Account', path: '/account' }
        : { label: 'Account', path: '/sign-in' },
      ...(signedIn ? [{ label: 'Orders', path: '/account/orders' }] : []),
    ];
  });
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
    if (path === '/' || path === '') {
      return 'Home';
    }
    if (path.startsWith('/shop') || path.startsWith('/product')) {
      return 'Shop';
    }
    if (path === '/account') {
      return 'Account';
    }
    if (path.startsWith('/account/orders')) {
      return 'Orders';
    }
    if (path.startsWith('/sign-in') || path.startsWith('/register') || path.startsWith('/forgot-password')) {
      return 'Account';
    }
    if (path.startsWith('/checkout') || path.startsWith('/pay') || path.startsWith('/paid')) {
      return 'Bag';
    }
    return '';
  });

  signOut(): void {
    this.auth.signOut();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    if (value && !this.router.url.startsWith('/shop')) {
      void this.router.navigate(['/shop']);
    }
  }
}
