import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatusPillComponent } from 'ecomm-components';
import { AdminProductsBaseDirective } from './products-base.directive';

@Component({
  selector: 'app-admin-products-desktop',
  imports: [StatusPillComponent],
  templateUrl: './products-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsDesktopComponent extends AdminProductsBaseDirective {}
