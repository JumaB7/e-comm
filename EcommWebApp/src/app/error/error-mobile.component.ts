import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { ErrorBase } from './error-base';

@Component({
  selector: 'app-error-mobile',
  imports: [NgClass, RouterLink, ButtonComponent],
  templateUrl: './error-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMobileComponent extends ErrorBase {}
