import { Directive, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Directive()
export class SignInBaseDirective {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  readonly email = signal('thabo@example.co.za');
  readonly password = signal('password');
  readonly error = this.auth.error;

  constructor() {
    this.auth.error.set('');
    if (this.route.snapshot.queryParamMap.get('returnUrl')?.startsWith('/admin')) {
      this.email.set('admin@veldsupply.co.za');
    }
  }

  setField(field: 'email' | 'password', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'email') {
      this.email.set(value);
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
