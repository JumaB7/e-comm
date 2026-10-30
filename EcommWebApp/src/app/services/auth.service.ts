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
  readonly busy = signal(false);

  signIn(email: string, password: string, returnUrl: string): void {
    this.submit('/api/auth/sign-in', { email, password }, returnUrl);
  }

  register(name: string, email: string, phone: string, password: string): void {
    this.submit('/api/auth/register', { name, email, phone, password }, '/shop');
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
