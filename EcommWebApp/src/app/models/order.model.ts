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
}
