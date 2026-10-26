import { Routes } from '@angular/router';
import { AdminProductsContainerComponent } from './admin/products/products-container.component';
import { OrderContainerComponent } from './admin/order/order-container.component';
import { OrdersContainerComponent } from './admin/orders/orders-container.component';
import { SalesContainerComponent } from './admin/sales/sales-container.component';
import { StockContainerComponent } from './admin/stock/stock-container.component';
import { CheckoutContainerComponent } from './checkout/checkout-container.component';
import { HomeContainerComponent } from './home/home-container.component';
import { PaidContainerComponent } from './paid/paid-container.component';
import { PayContainerComponent } from './pay/pay-container.component';
import { ProductContainerComponent } from './product/product-container.component';
import { RegisterContainerComponent } from './register/register-container.component';
import { ShopContainerComponent } from './shop/shop-container.component';
import { AdminShellContainerComponent } from './shell/admin-shell-container.component';
import { ShopShellContainerComponent } from './shell/shop-shell-container.component';
import { SignInContainerComponent } from './sign-in/sign-in-container.component';

export const routes: Routes = [
  {
    path: '',
    component: ShopShellContainerComponent,
    children: [
      { path: '', component: HomeContainerComponent },
      { path: 'shop', component: ShopContainerComponent },
      { path: 'product/:sku', component: ProductContainerComponent },
      { path: 'checkout', component: CheckoutContainerComponent },
      { path: 'sign-in', component: SignInContainerComponent },
      { path: 'register', component: RegisterContainerComponent },
      { path: 'pay', component: PayContainerComponent },
      { path: 'paid', component: PaidContainerComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminShellContainerComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'orders' },
      { path: 'orders', component: OrdersContainerComponent },
      { path: 'orders/:id', component: OrderContainerComponent },
      { path: 'products', component: AdminProductsContainerComponent },
      { path: 'sales', component: SalesContainerComponent },
      { path: 'stock', component: StockContainerComponent },
    ],
  },
];
