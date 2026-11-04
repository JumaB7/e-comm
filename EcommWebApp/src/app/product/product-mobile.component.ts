import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { ProductBaseDirective } from './product-base.directive';

@Component({
  selector: 'app-product-mobile',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './product-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductMobileComponent extends ProductBaseDirective {}
