export interface ProductSpec {
  label: string;
  value: string;
}

export type ProductSpecField =
  | 'magnification'
  | 'weight'
  | 'waterproof'
  | 'size'
  | 'blade'
  | 'volume'
  | 'power';

export interface CategorySpecField {
  label: string;
  key: ProductSpecField;
}

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: string;
  amount: number;
  stock: number;
  low: boolean;
  blurb: string;
  image: string;
  specs: ProductSpec[];
}

export interface ProductWrite {
  name: string;
  sku: string;
  category: string;
  priceRands: number;
  stock: number;
  specs: ProductSpec[];
}

export interface StockRow {
  shown: number;
  editing: boolean;
  menuOpen: boolean;
  canDecrease: boolean;
  busy: boolean;
  invalid: boolean;
}
