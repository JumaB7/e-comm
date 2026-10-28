import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatusPillComponent } from 'ecomm-components';
import { AccountOrderBaseDirective } from './account-order-base.directive';

@Component({
  selector: 'app-account-order-mobile',
  imports: [NgClass, RouterLink, StatusPillComponent],
  templateUrl: './account-order-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrderMobileComponent extends AccountOrderBaseDirective {}
