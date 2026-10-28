import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from 'ecomm-components';
import { CheckoutBaseDirective } from './checkout-base.directive';

@Component({
  selector: 'app-checkout-desktop',
  imports: [NgClass, ReactiveFormsModule, ButtonComponent],
  templateUrl: './checkout-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutDesktopComponent extends CheckoutBaseDirective {}
