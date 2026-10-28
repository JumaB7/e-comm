import { CartQuote } from './cart.model';
import { OrderSummary } from './order.model';
import { ShopDefaults } from './shop-defaults.model';

export const emptyCartQuote: CartQuote = { subtotal: '', courier: '', total: '', courierFee: '', lines: [] };

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

export const salesBarSteps = [
  { heightClass: 'h-17.5', mobileClass: 'h-12' },
  { heightClass: 'h-21', mobileClass: 'h-14' },
  { heightClass: 'h-24', mobileClass: 'h-16' },
  { heightClass: 'h-28', mobileClass: 'h-18.5' },
  { heightClass: 'h-32.5', mobileClass: 'h-22' },
  { heightClass: 'h-42', mobileClass: 'h-28' },
];
