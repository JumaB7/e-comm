import { Directive, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Directive()
export class RegisterBaseDirective {
  private readonly auth = inject(AuthService);
  readonly submitted = signal(false);
  readonly error = this.auth.error;
  readonly form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  constructor() {
    this.auth.error.set('');
  }

  submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.auth.register(value.fullName, value.email, value.phone, value.password);
  }
}
