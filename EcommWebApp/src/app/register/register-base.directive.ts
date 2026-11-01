import { Directive, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { saMobileValidator } from '../forms/sa-mobile.validator';
import { AuthService } from '../services/auth.service';
import { PasswordMatchService } from '../services/password-match.service';

@Directive()
export class RegisterBaseDirective {
  private readonly auth = inject(AuthService);
  private readonly passwords = inject(PasswordMatchService);
  readonly submitted = signal(false);
  readonly passwordVisible = signal(false);
  readonly confirmVisible = signal(false);
  readonly error = this.auth.error;
  readonly busy = this.auth.busy;
  readonly form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [saMobileValidator()] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, { validators: [(group) => this.passwords.match(group)] });

  constructor() {
    this.auth.error.set('');
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.busy()) {
      return;
    }
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.auth.register(value.fullName, value.email, value.phone, value.password);
  }
}
