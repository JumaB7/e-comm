import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { CheckoutBaseDirective } from './checkout-base.directive';

@Component({
  selector: 'app-checkout-desktop',
  imports: [NgClass, RouterLink, ButtonComponent],
  templateUrl: './checkout-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutDesktopComponent extends CheckoutBaseDirective {}
