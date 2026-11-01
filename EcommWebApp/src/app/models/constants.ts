import { CartQuote } from './cart.model';
import { OrderSectionDefinition, OrderSummary } from './order.model';
import { CategorySpecField } from './product.model';
import { SalesDelta } from './sales.model';
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

export const emptySalesDelta: SalesDelta = { text: 'No change', up: false, flat: true };

export const productCategories: readonly string[] = ['Optics', 'Apparel', 'Knives', 'Packs', 'Camp'];

export const categorySpecFields: Record<string, CategorySpecField[]> = {
  Optics: [
    { label: 'Magnification', key: 'magnification' },
    { label: 'Weight', key: 'weight' },
    { label: 'Waterproof', key: 'waterproof' },
  ],
  Apparel: [{ label: 'Size', key: 'size' }],
  Knives: [{ label: 'Blade', key: 'blade' }],
  Packs: [{ label: 'Volume', key: 'volume' }],
  Camp: [{ label: 'Power', key: 'power' }],
};

export const skuPrefixes: Record<string, string> = {
  Optics: 'VS-OPT-',
  Apparel: 'VS-APP-',
  Knives: 'VS-KNF-',
  Packs: 'VS-PCK-',
  Camp: 'VS-CMP-',
};

export const homeCategories = [
  { name: 'Optics', detail: 'Glass and lights', short: 'Glass', image: '/products/VS-OPT-1042.jpg' },
  { name: 'Apparel', detail: 'Stalking layers', short: 'Layers', image: '/products/VS-APP-220.jpg' },
  { name: 'Knives', detail: 'Field tools', short: 'Tools', image: '/products/VS-KNF-018.jpg' },
  { name: 'Camp', detail: 'Blinds and packs', short: 'Blinds', image: '/products/VS-CMP-014.jpg' },
];

export const shopFilters = [
  { label: 'ALL', category: '' },
  { label: 'OPTICS', category: 'Optics' },
  { label: 'APPAREL', category: 'Apparel' },
  { label: 'KNIVES', category: 'Knives' },
  { label: 'CAMP', category: 'Camp' },
  { label: 'PACKS', category: 'Packs' },
];

export const payMethods = [
  { id: 'card', title: 'Card', detail: 'Visa or Mastercard on PayFast' },
  { id: 'eft', title: 'Instant EFT', detail: 'FNB, Absa, Standard Bank, Nedbank, and others' },
  { id: 'capitec', title: 'Capitec Pay', detail: 'Pay from the Capitec app' },
];

export const adminLinks = [
  { label: 'Orders', path: '/admin/orders', exact: false },
  { label: 'Products', path: '/admin/products', exact: true },
  { label: 'Sales', path: '/admin/sales', exact: true },
  { label: 'Stock', path: '/admin/stock', exact: true },
];

export const orderSectionDefinitions: OrderSectionDefinition[] = [
  { queue: 'pack', title: 'To pack', detail: 'Paid orders that still need packing.', always: true },
  { queue: 'ship', title: 'To ship', detail: 'Packed. Open the order to add a tracking number.', always: true },
  { queue: 'collect', title: 'To collect', detail: 'Packed and waiting for the customer at the shop.', always: true },
  { queue: 'delivery', title: 'Out for delivery', detail: 'Shipped. Mark delivered once it arrives.', always: true },
  { queue: 'waiting', title: 'Awaiting payment', detail: 'Not paid yet.', always: false },
  { queue: 'done', title: 'Completed', detail: 'Delivered or collected.', always: false },
];
