import { Directive, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ShopDefaultsService } from '../services/shop-defaults.service';

@Directive()
export class SignInBaseDirective {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly shop = inject(ShopDefaultsService);
  private readonly adminSignIn = this.route.snapshot.queryParamMap.get('returnUrl')?.startsWith('/admin') ?? false;
  readonly submitted = signal(false);
  readonly passwordVisible = signal(false);
  readonly error = this.auth.error;
  readonly notice = this.auth.notice;
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.auth.error.set('');
    effect(() => {
      const defaults = this.shop.defaults();
      const email = this.adminSignIn ? defaults.adminEmail : defaults.customerEmail;
      const control = this.form.controls.email;
      if (control.dirty || !email) {
        return;
      }
      control.setValue(email);
      control.markAsPristine();
    });
  }

  submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.auth.notice.set('');
    const requested = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
    const returnUrl = requested.startsWith('/') && !requested.startsWith('//') ? requested : '';
    this.auth.signIn(this.form.controls.email.value, this.form.controls.password.value, returnUrl);
  }
}
