export interface CartLine {
  sku: string;
  name: string;
  qty: number;
  detail: string;
}

export interface CartQuoteLine {
  sku: string;
  name: string;
  price: string;
}

export interface CartQuote {
  subtotal: string;
  courier: string;
  total: string;
  courierFee: string;
  lines: CartQuoteLine[];
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
