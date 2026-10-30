import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { AccountProfileBaseDirective } from './account-profile-base.directive';

@Component({
  selector: 'app-account-profile-mobile',
  imports: [NgClass, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './account-profile-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountProfileMobileComponent extends AccountProfileBaseDirective {}
