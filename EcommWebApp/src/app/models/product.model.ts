export interface ProductSpec {
  label: string;
  value: string;
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
  specs: ProductSpec[];
}
