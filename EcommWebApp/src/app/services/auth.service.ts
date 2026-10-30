import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, finalize, of, tap } from 'rxjs';
import { AuthSession, CheckoutProfile } from '../models/auth.model';
import { apiMessage } from './api-message';
import { SpinnerService } from './spinner.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly spinner = inject(SpinnerService);
  readonly name = signal(sessionStorage.getItem('veld-name') ?? '');
  readonly email = signal(sessionStorage.getItem('veld-email') ?? '');
  readonly phone = signal(sessionStorage.getItem('veld-phone') ?? '');
  readonly role = signal(sessionStorage.getItem('veld-role') ?? '');
  readonly error = signal('');
  readonly notice = signal('');
  readonly busy = signal(false);

  signIn(email: string, password: string, returnUrl: string): void {
    this.submit('/api/auth/sign-in', { email, password }, returnUrl);
  }

  register(name: string, email: string, phone: string, password: string): void {
    this.submit('/api/auth/register', { name, email, phone, password }, '/shop');
  }

  requestPasswordReset(email: string): void {
    if (this.busy()) {
      return;
    }
    this.error.set('');
    this.notice.set('');
    this.busy.set(true);
    this.spinner
      .pending(
        this.http
          .post<{ message: string; resetLink?: string }>('/api/auth/forgot-password', { email })
          .pipe(
            catchError((error: HttpErrorResponse) => {
              this.error.set(apiMessage(error));
              return of(null);
            }),
          ),
      )
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        const extra = result.resetLink ? ` Dev link: ${result.resetLink}` : '';
        this.notice.set((result.message || 'If that email is on an account, we sent a reset link.') + extra);
      });
  }

  confirmPasswordReset(token: string, password: string): void {
    if (this.busy()) {
      return;
    }
    this.error.set('');
    this.notice.set('');
    this.busy.set(true);
    this.spinner
      .pending(
        this.http.post<{ message: string }>('/api/auth/reset-password', { token, password }).pipe(
          catchError((error: HttpErrorResponse) => {
            this.error.set(apiMessage(error));
            return of(null);
          }),
        ),
      )
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.notice.set(result.message || 'Password updated. Sign in with the new password.');
        void this.router.navigateByUrl('/sign-in');
      });
  }

  clearSession(): void {
    sessionStorage.removeItem('veld-token');
    sessionStorage.removeItem('veld-role');
    sessionStorage.removeItem('veld-name');
    sessionStorage.removeItem('veld-email');
    sessionStorage.removeItem('veld-phone');
    this.name.set('');
    this.email.set('');
    this.phone.set('');
    this.role.set('');
  }

  signOut(): void {
    this.clearSession();
    void this.router.navigateByUrl('/');
  }

  profile() {
    return this.http.get<CheckoutProfile>('/api/auth/profile').pipe(catchError(() => of(undefined)));
  }

  private submit(url: string, body: object, returnUrl: string): void {
    if (this.busy()) {
      return;
    }
    // Drop any previous session before sign-in/register so profile calls stop 401-ing.
    this.clearSession();
    this.error.set('');
    this.busy.set(true);
    this.spinner
      .pending(
        this.http.post<AuthSession>(url, body).pipe(
          tap((session) => this.store(session)),
          catchError((error: HttpErrorResponse) => {
            this.error.set(apiMessage(error));
            return of(null);
          }),
        ),
        { immediate: true },
      )
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe((session) => {
        if (!session) {
          return;
        }
        if (returnUrl.startsWith('/admin') && session.role !== 'Admin') {
          this.error.set('This account is not an admin.');
          return;
        }
        void this.router.navigateByUrl(this.destination(session.role, returnUrl));
      });
  }

  private destination(role: string, returnUrl: string): string {
    if (role === 'Admin' && !returnUrl.startsWith('/admin')) {
      return returnUrl || '/admin';
    }
    return returnUrl || '/shop';
  }

  private store(session: AuthSession): void {
    sessionStorage.setItem('veld-token', session.token);
    sessionStorage.setItem('veld-role', session.role);
    sessionStorage.setItem('veld-name', session.name);
    sessionStorage.setItem('veld-email', session.email);
    sessionStorage.setItem('veld-phone', session.phone ?? '');
    this.role.set(session.role);
    this.name.set(session.name);
    this.email.set(session.email);
    this.phone.set(session.phone ?? '');
  }
}
