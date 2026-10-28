export interface AuthSession {
  token: string;
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
}
