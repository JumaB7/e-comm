import { inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

export class ForgotPasswordBase {
  private readonly auth = inject(AuthService);
  readonly submitted = signal(false);
  readonly error = this.auth.error;
  readonly notice = this.auth.notice;
  readonly busy = this.auth.busy;
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

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
    this.auth.requestPasswordReset(this.form.controls.email.value);
  }
}
