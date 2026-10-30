import { inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

export class ResetPasswordBase {
  private readonly auth = inject(AuthService);
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
    { validators: [passwordsMatch] },
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
