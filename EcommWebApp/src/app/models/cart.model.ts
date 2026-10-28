export interface CartLine {
  sku: string;
  name: string;
  amount: number;
  qty: number;
  detail: string;
}

export interface CheckoutDetails {
  email: string;
  phone: string;
  name: string;
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  delivery: 'courier' | 'collect';
  method: string;
  lines: { sku: string; qty: number; detail: string }[];
}
