import { UserData } from '../models/auth.model';

const emailClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
const nameClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const phoneClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone';

export function readAuthClaims(token: string | null): UserData | undefined {
  if (!token) {
    return undefined;
  }
  const payload = token.split('.')[1];
  if (!payload) {
    return undefined;
  }
  try {
    const encoded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = encoded.padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), '=');
    const claims = JSON.parse(atob(padded)) as Record<string, unknown>;
    if (typeof claims['exp'] === 'number' && claims['exp'] * 1000 <= Date.now()) {
      return undefined;
    }
    return {
      name: claimString(claims, 'unique_name', 'name', nameClaim),
      email: claimString(claims, 'email', emailClaim),
      phone: claimString(claims, 'phone', 'mobilephone', phoneClaim),
      role: claimString(claims, 'role', roleClaim),
    };
  } catch {
    return undefined;
  }
}

function claimString(claims: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0];
    }
  }
  return '';
}
