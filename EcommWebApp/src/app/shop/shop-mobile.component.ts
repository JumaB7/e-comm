import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardMobileComponent } from 'ecomm-components';
import { ShopPageBaseDirective } from './shop-base.directive';

@Component({
  selector: 'app-shop-mobile',
  imports: [RouterLink, ProductCardMobileComponent],
  templateUrl: './shop-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopMobileComponent extends ShopPageBaseDirective {}
