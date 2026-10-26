import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { PayBaseDirective } from './pay-base.directive';

@Component({
  selector: 'app-pay-mobile',
  imports: [NgClass, RouterLink, ButtonComponent],
  templateUrl: './pay-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayMobileComponent extends PayBaseDirective {}
