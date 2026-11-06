export interface AuthSession {
  token: string;
  refreshToken: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

/** Signed-in identity from JWT claims — memory only (AO-style userData). */
export interface UserData {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface CheckoutProfile {
  name: string;
  email: string;
  phone: string;
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  delivery: 'courier' | 'collect';
  /** Optional while older APIs omit it; default true on the client. */
  prefillCheckout?: boolean;
}

export interface ProfileUpdate {
  session: AuthSession;
  profile: CheckoutProfile;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  phone: string;
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  delivery: 'courier' | 'collect';
  prefillCheckout: boolean;
}
