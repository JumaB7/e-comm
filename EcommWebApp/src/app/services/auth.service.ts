import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { AuthSession, CheckoutProfile, ProfileUpdate, UpdateProfileRequest, UserData } from '../models/auth.model';
import { apiMessage } from './api-message';
import { readAuthClaims } from './jwt-claims';
import { SessionStoreService } from './session-store.service';
import { SpinnerService } from './spinner.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly spinner = inject(SpinnerService);
  private readonly session = inject(SessionStoreService);
  /** Memory-only identity from JWT — same idea as AO userData, not sessionStorage PII. */
  private readonly userDataState = signal<UserData | undefined>(undefined);
  private readonly userData$ = toObservable(this.userDataState);
  readonly userData = this.userDataState.asReadonly();
  readonly error = signal('');
  readonly notice = signal('');
  readonly busy = signal(false);
  private profile$: Observable<CheckoutProfile | undefined> | undefined;

  constructor() {
    this.session.scrubLegacyProfileKeys();
    this.hydrateFromToken();
  }

  /** AO-style accessor: Observable of the signed-in user (or undefined). */
  getUserData(): Observable<UserData | undefined> {
    return this.userData$;
  }

  token(): string | null {
    return this.session.getToken();
  }

  signedIn(): boolean {
    return !!this.userDataState();
  }

  signIn(email: string, password: string, returnUrl: string): void {
    this.submit('/api/auth/sign-in', { email, password }, returnUrl);
  }

  register(name: string, email: string, phone: string, password: string): void {
    this.submit('/api/auth/register', { name, email, phone, password }, '/shop');
  }

  resetPassword(email: string, phone: string, password: string): void {
    if (this.busy()) {
      return;
    }
    this.error.set('');
    this.notice.set('');
    this.busy.set(true);
    this.spinner
      .pending(
        this.http.post<{ message: string }>('/api/auth/reset-password', { email, phone, password }).pipe(
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
    this.session.clearAuth();
    this.profile$ = undefined;
    this.userDataState.set(undefined);
  }

  signOut(): void {
    this.clearSession();
    void this.router.navigateByUrl('/');
  }

  profile(): Observable<CheckoutProfile | undefined> {
    if (!this.profile$) {
      this.profile$ = this.http.get<CheckoutProfile>('/api/auth/profile').pipe(
        catchError(() => of(undefined)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.profile$;
  }

  updateProfile(body: UpdateProfileRequest): Observable<CheckoutProfile | undefined> {
    if (this.busy()) {
      return of(undefined);
    }
    this.error.set('');
    this.notice.set('');
    this.busy.set(true);
    return this.spinner
      .pending(
        this.http.put<ProfileUpdate>('/api/auth/profile', body).pipe(
          tap((result) => {
            this.store(result.session);
            this.profile$ = of(result.profile).pipe(shareReplay({ bufferSize: 1, refCount: false }));
          }),
          map((result) => result.profile),
          catchError((error: HttpErrorResponse) => {
            this.error.set(apiMessage(error));
            return of(undefined);
          }),
        ),
      )
      .pipe(finalize(() => this.busy.set(false)));
  }

  private hydrateFromToken(): void {
    const claims = readAuthClaims(this.session.getToken());
    if (!claims) {
      this.session.clearAuth();
      this.userDataState.set(undefined);
      return;
    }
    this.userDataState.set(claims);
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
    this.session.setToken(session.token);
    this.session.scrubLegacyProfileKeys();
    this.profile$ = undefined;
    const claims = readAuthClaims(session.token);
    this.userDataState.set(
      claims ?? {
        name: session.name,
        email: session.email,
        phone: session.phone ?? '',
        role: session.role,
      },
    );
  }
}
