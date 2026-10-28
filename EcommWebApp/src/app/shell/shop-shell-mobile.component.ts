import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ShopShellBaseDirective } from './shop-shell-base.directive';

@Component({
  selector: 'app-shop-shell-mobile',
  imports: [NgClass, RouterLink, RouterOutlet],
  templateUrl: './shop-shell-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopShellMobileComponent extends ShopShellBaseDirective {}
