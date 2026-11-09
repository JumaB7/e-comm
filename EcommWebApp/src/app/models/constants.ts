import { CartQuote, CartValidate } from './cart.model';
import { OrderSummary } from './order.model';
import { ShopDefaults } from './shop-defaults.model';

export const emptyCartQuote: CartQuote = { subtotal: '', courier: '', total: '', courierFee: '', lines: [] };

export const emptyCartValidate: CartValidate = {
  ok: false,
  subtotal: '',
  courier: '',
  total: '',
  courierFee: '',
  lines: [],
  messages: [],
};

export const emptyShopDefaults: ShopDefaults = {
  customerEmail: '',
  adminEmail: '',
  name: '',
  phone: '',
  street: '',
  suburb: '',
  city: '',
  province: '',
  postalCode: '',
  delivery: 'courier',
  bag: [],
};

export const emptyOrderSummary: OrderSummary = {
  today: 0,
  paidToday: 'R 0',
  paidTodayShort: 'R 0',
  awaiting: 0,
  lowStock: 0,
};

export const scopeIntroKey = 'veld-scope-intro';
