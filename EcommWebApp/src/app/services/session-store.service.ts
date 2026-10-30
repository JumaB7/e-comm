import { Injectable } from '@angular/core';

/** Thin sessionStorage accessor for opaque session keys — not a PII profile cache. */
@Injectable({ providedIn: 'root' })
export class SessionStoreService {
  private readonly tokenKey = 'veld-token';
  private readonly bagKey = 'veld-bag';
  private readonly receiptKey = 'veld-receipt';
  private readonly legacyProfileKeys = ['veld-name', 'veld-email', 'veld-phone', 'veld-role'] as const;

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    sessionStorage.removeItem(this.tokenKey);
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
    }
  }

  clearAuth(): void {
    this.clearToken();
    this.scrubLegacyProfileKeys();
  }
}
