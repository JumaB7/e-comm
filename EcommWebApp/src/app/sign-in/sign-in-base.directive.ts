import { Directive, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ShopDefaultsService } from '../services/shop-defaults.service';

@Directive()
export class SignInBaseDirective {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly shop = inject(ShopDefaultsService);
  private readonly adminSignIn = this.route.snapshot.queryParamMap.get('returnUrl')?.startsWith('/admin') ?? false;
  private readonly typedEmail = signal<string | null>(null);
  readonly email = computed(() => {
    const typed = this.typedEmail();
    if (typed !== null) {
      return typed;
    }
    const defaults = this.shop.defaults();
    return this.adminSignIn ? defaults.adminEmail : defaults.customerEmail;
  });
  readonly password = signal('');
  readonly error = this.auth.error;

  constructor() {
    this.auth.error.set('');
  }

  setField(field: 'email' | 'password', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'email') {
      this.typedEmail.set(value);
    } else {
      this.password.set(value);
    }
  }

  submit(event: Event): void {
    event.preventDefault();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/shop';
    this.auth.signIn(this.email(), this.password(), returnUrl);
  }
}
