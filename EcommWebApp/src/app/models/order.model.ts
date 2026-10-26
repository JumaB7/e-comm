export interface ShopOrder {
  id: string;
  customer: string;
  email: string;
  total: string;
  status: string;
  tone: 'paid' | 'packed' | 'awaiting' | 'low';
  when: string;
  reference: string;
}
