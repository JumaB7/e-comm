import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatusPillComponent } from 'ecomm-components';
import { AccountOrderBaseDirective } from './account-order-base.directive';

@Component({
  selector: 'app-account-order-desktop',
  imports: [NgClass, RouterLink, StatusPillComponent],
  templateUrl: './account-order-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrderDesktopComponent extends AccountOrderBaseDirective {}
