import { inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PasswordMatchService } from '../services/password-match.service';

export class ResetPasswordBase {
  private readonly auth = inject(AuthService);
  private readonly passwords = inject(PasswordMatchService);
  private readonly route = inject(ActivatedRoute);
  readonly submitted = signal(false);
  readonly passwordVisible = signal(false);
  readonly confirmVisible = signal(false);
  readonly error = this.auth.error;
  readonly busy = this.auth.busy;
  readonly token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
  readonly form = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: [(group) => this.passwords.match(group)] },
  );

  constructor() {
    this.auth.error.set('');
    this.auth.notice.set('');
    if (!this.token) {
      this.auth.error.set('That reset link is missing or incomplete. Request a new one.');
    }
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.busy() || !this.token) {
      return;
    }
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.auth.confirmPasswordReset(this.token, this.form.controls.password.value);
  }
}
