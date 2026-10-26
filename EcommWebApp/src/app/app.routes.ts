import { Routes } from '@angular/router';
import { AdminPage } from './pages/admin/admin';
import { HomePage } from './pages/home/home';
import { PayPage } from './pages/pay/pay';
import { RegisterPage } from './pages/register/register';
import { ShopPage } from './pages/shop/shop';
import { SignInPage } from './pages/sign-in/sign-in';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'shop', component: ShopPage },
  { path: 'sign-in', component: SignInPage },
  { path: 'register', component: RegisterPage },
  { path: 'pay', component: PayPage },
  { path: 'admin', component: AdminPage },
];
