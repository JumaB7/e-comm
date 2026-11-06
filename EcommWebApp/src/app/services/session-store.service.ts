import { Injectable } from '@angular/core';

/**
 * Opaque session keys in sessionStorage only (never localStorage) — limits XSS persistence.
 * Do not log token values.
 */
@Injectable({ providedIn: 'root' })
export class SessionStoreService {
  private readonly tokenKey = 'veld-token';
  private readonly refreshTokenKey = 'veld-refresh-token';
  private readonly bagKey = 'veld-bag';
  /** Signed-out users' bags, keyed by email — restored on the next sign-in. */
  private readonly bagsByEmailKey = 'veld-bags-by-email';
  private readonly receiptKey = 'veld-receipt';
  private readonly legacyProfileKeys = ['veld-name', 'veld-email', 'veld-phone', 'veld-role'] as const;

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    this.scrubTokenFromLocalStorage();
    sessionStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    sessionStorage.removeItem(this.tokenKey);
    this.scrubTokenFromLocalStorage();
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.refreshTokenKey);
  }

  setRefreshToken(token: string): void {
    this.scrubTokenFromLocalStorage();
    sessionStorage.setItem(this.refreshTokenKey, token);
  }

  clearRefreshToken(): void {
    sessionStorage.removeItem(this.refreshTokenKey);
    this.scrubTokenFromLocalStorage();
  }

  getBag(): string | null {
    return sessionStorage.getItem(this.bagKey);
  }

  setBag(raw: string): void {
    sessionStorage.setItem(this.bagKey, raw);
  }

  clearBag(): void {
    sessionStorage.removeItem(this.bagKey);
  }

  stashBagFor(email: string, raw: string): void {
    const key = email.trim().toLowerCase();
    if (!key) {
      return;
    }
    const map = this.readBagsByEmail();
    map[key] = raw;
    sessionStorage.setItem(this.bagsByEmailKey, JSON.stringify(map));
  }

  takeStashedBag(email: string): string | null {
    const key = email.trim().toLowerCase();
    if (!key) {
      return null;
    }
    const map = this.readBagsByEmail();
    const raw = map[key] ?? null;
    if (raw !== null) {
      delete map[key];
      sessionStorage.setItem(this.bagsByEmailKey, JSON.stringify(map));
    }
    return raw;
  }

  getReceipt(): string | null {
    return sessionStorage.getItem(this.receiptKey);
  }

  setReceipt(key: string): void {
    sessionStorage.setItem(this.receiptKey, key);
  }

  clearReceipt(): void {
    sessionStorage.removeItem(this.receiptKey);
  }

  /** Removes old app-written profile copies; identity lives in the JWT + memory. */
  scrubLegacyProfileKeys(): void {
    for (const key of this.legacyProfileKeys) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    }
    this.scrubTokenFromLocalStorage();
  }

  clearAuth(): void {
    this.clearToken();
    this.clearRefreshToken();
    this.scrubLegacyProfileKeys();
  }

  private scrubTokenFromLocalStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  private readBagsByEmail(): Record<string, string> {
    try {
      const raw = sessionStorage.getItem(this.bagsByEmailKey);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw) as Record<string, string>;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
}
