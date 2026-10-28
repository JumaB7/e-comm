import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { AuthSession } from '../models/auth.model';
import { apiMessage } from './api-message';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly name = signal(sessionStorage.getItem('veld-name') ?? '');
  readonly role = signal(sessionStorage.getItem('veld-role') ?? '');
  readonly error = signal('');

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
    this.name.set('');
    this.role.set('');
  }

  signOut(): void {
    this.clearSession();
    void this.router.navigateByUrl('/');
  }

  private submit(url: string, body: object, returnUrl: string): void {
    this.error.set('');
    this.http.post<AuthSession>(url, body).pipe(
      tap((session) => this.store(session)),
      catchError((error: HttpErrorResponse) => {
        this.error.set(apiMessage(error));
        return of(null);
      }),
    ).subscribe((session) => {
      if (!session) {
        return;
      }
      if (returnUrl.startsWith('/admin') && session.role !== 'Admin') {
        this.error.set('This account is not an admin.');
        return;
      }
      void this.router.navigateByUrl(returnUrl || '/shop');
    });
  }

  private store(session: AuthSession): void {
    sessionStorage.setItem('veld-token', session.token);
    sessionStorage.setItem('veld-role', session.role);
    sessionStorage.setItem('veld-name', session.name);
    this.role.set(session.role);
    this.name.set(session.name);
  }
}
