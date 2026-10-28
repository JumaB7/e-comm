import { Directive, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive()
export class RegisterBaseDirective {
  private readonly auth = inject(AuthService);
  readonly fullName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly password = signal('');
  readonly error = this.auth.error;

  constructor() {
    this.auth.error.set('');
  }

  setField(field: 'fullName' | 'email' | 'phone' | 'password', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'fullName') {
      this.fullName.set(value);
    } else if (field === 'email') {
      this.email.set(value);
    } else if (field === 'phone') {
      this.phone.set(value);
    } else {
      this.password.set(value);
    }
  }

  submit(event: Event): void {
    event.preventDefault();
    this.auth.register(this.fullName(), this.email(), this.phone(), this.password());
  }
}
