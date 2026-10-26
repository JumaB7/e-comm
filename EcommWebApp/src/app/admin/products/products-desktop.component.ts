import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, StatusPillComponent } from 'ecomm-components';
import { AdminProductsBaseDirective } from './products-base.directive';

@Component({
  selector: 'app-admin-products-desktop',
  imports: [ButtonComponent, StatusPillComponent],
  templateUrl: './products-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsDesktopComponent extends AdminProductsBaseDirective {}
