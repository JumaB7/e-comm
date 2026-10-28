import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from 'ecomm-components';
import { CheckoutBaseDirective } from './checkout-base.directive';

@Component({
  selector: 'app-checkout-mobile',
  imports: [NgClass, ReactiveFormsModule, ButtonComponent],
  templateUrl: './checkout-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutMobileComponent extends CheckoutBaseDirective {}
