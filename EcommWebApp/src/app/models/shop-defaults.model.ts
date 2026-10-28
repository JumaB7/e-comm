import { CartLine } from './cart.model';

export interface ShopDefaults {
  customerEmail: string;
  adminEmail: string;
  name: string;
  phone: string;
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  delivery: 'courier' | 'collect';
  bag: CartLine[];
}
