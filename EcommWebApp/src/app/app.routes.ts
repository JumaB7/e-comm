import { Routes } from '@angular/router';
import { AccountOrderContainerComponent } from './account/order/account-order-container.component';
import { AccountOrdersContainerComponent } from './account/orders/account-orders-container.component';
import { AccountProfileContainerComponent } from './account/profile/account-profile-container.component';
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
import { ForgotPasswordContainerComponent } from './forgot-password/forgot-password-container.component';
import { ErrorContainerComponent } from './error/error-container.component';
import { HelpContainerComponent } from './help/help-container.component';
import { ResetPasswordContainerComponent } from './reset-password/reset-password-container.component';
import { SignInContainerComponent } from './sign-in/sign-in-container.component';
import { adminGuard } from './services/admin.guard';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShopShellContainerComponent,
    children: [
      { path: '', component: HomeContainerComponent },
      { path: 'shop', component: ShopContainerComponent },
      { path: 'product/:sku', component: ProductContainerComponent },
      { path: 'checkout', component: CheckoutContainerComponent },
      { path: 'account', component: AccountProfileContainerComponent, canActivate: [authGuard] },
      { path: 'account/orders', component: AccountOrdersContainerComponent, canActivate: [authGuard] },
      { path: 'account/orders/:id', component: AccountOrderContainerComponent, canActivate: [authGuard] },
      { path: 'sign-in', component: SignInContainerComponent },
      { path: 'forgot-password', component: ForgotPasswordContainerComponent },
      { path: 'reset-password', component: ResetPasswordContainerComponent },
      { path: 'register', component: RegisterContainerComponent },
      { path: 'help/:page', component: HelpContainerComponent },
      { path: 'pay', component: PayContainerComponent },
      { path: 'paid', component: PaidContainerComponent },
      { path: 'error/:code', component: ErrorContainerComponent },
      { path: '**', component: ErrorContainerComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminShellContainerComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'orders' },
      { path: 'orders', component: OrdersContainerComponent },
      { path: 'orders/:id', component: OrderContainerComponent },
      { path: 'products', component: AdminProductsContainerComponent },
      { path: 'sales', component: SalesContainerComponent },
      { path: 'stock', component: StockContainerComponent },
      { path: '**', redirectTo: '/error/404' },
    ],
  },
];
