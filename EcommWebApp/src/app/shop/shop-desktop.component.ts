import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardDesktopComponent } from 'ecomm-components';
import { ShopPageBaseDirective } from './shop-base.directive';

@Component({
  selector: 'app-shop-desktop',
  imports: [NgClass, RouterLink, ProductCardDesktopComponent],
  templateUrl: './shop-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopDesktopComponent extends ShopPageBaseDirective {}
