import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { ProductBaseDirective } from './product-base.directive';

@Component({
  selector: 'app-product-desktop',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './product-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDesktopComponent extends ProductBaseDirective {}
