export interface OrderSummary {
  today: number;
  paidToday: string;
  paidTodayShort: string;
  awaiting: number;
  lowStock: number;
}

export interface CheckoutResponse {
  order: ShopOrder;
  receiptKey: string;
  mode: 'local' | 'payfast';
  payFastUrl?: string;
  fields?: Record<string, string>;
}

export interface OrderSection {
  queue: string;
  title: string;
  detail: string;
  orders: ShopOrder[];
}

export interface OrderSectionDefinition {
  queue: string;
  title: string;
  detail: string;
  always: boolean;
}

export interface ProgressStep {
  label: string;
  done: boolean;
  current: boolean;
}

export interface ShopOrder {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  total: string;
  status: string;
  tone: 'paid' | 'packed' | 'awaiting' | 'low';
  fulfilment: string;
  fulfilmentNote: string;
  reference: string;
  paidDetail: string;
  paymentNote: string;
  deliveryNote: string;
  lines: string[];
  placed: string;
  delivery: string;
  tracking: string;
  fulfilmentTone: 'paid' | 'packed' | 'awaiting' | 'low' | 'ship' | 'collect';
  alert: string;
  queue: string;
}
