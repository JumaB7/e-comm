import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent, StatusPillComponent } from 'ecomm-components';
import { AdminProductsBaseDirective } from './products-base.directive';

@Component({
  selector: 'app-admin-products-desktop',
  imports: [NgClass, ReactiveFormsModule, ButtonComponent, StatusPillComponent],
  templateUrl: './products-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsDesktopComponent extends AdminProductsBaseDirective {}
