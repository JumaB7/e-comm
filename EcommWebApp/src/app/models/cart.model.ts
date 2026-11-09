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

/** Read-only availability check — not a stock reservation. */
export type CartValidateStatus = 'ok' | 'reduced' | 'unavailable' | 'missing';

export interface CartValidateLine {
  sku: string;
  name: string;
  requestedQty: number;
  availableStock: number;
  pricedQty: number;
  unitPrice: string;
  linePrice: string;
  status: CartValidateStatus;
  message: string;
}

export interface CartValidate {
  ok: boolean;
  subtotal: string;
  courier: string;
  total: string;
  courierFee: string;
  lines: CartValidateLine[];
  messages: string[];
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
