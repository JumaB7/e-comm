import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from 'ecomm-components';
import { PayBaseDirective } from './pay-base.directive';

@Component({
  selector: 'app-pay-desktop',
  imports: [NgClass, ButtonComponent],
  templateUrl: './pay-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayDesktopComponent extends PayBaseDirective {}
