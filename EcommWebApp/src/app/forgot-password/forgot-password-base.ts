import { inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

export class ForgotPasswordBase {
  private readonly auth = inject(AuthService);
  readonly submitted = signal(false);
  readonly passwordVisible = signal(false);
  readonly confirmVisible = signal(false);
  readonly error = this.auth.error;
  readonly busy = this.auth.busy;
  readonly form = new FormGroup(
    {
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: [passwordsMatch] },
  );

  constructor() {
    this.auth.error.set('');
    this.auth.notice.set('');
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
    this.auth.resetPassword(value.email, value.phone, value.password);
  }
}
