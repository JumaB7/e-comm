import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ecomm-components';
import { ErrorBase } from './error-base';

@Component({
  selector: 'app-error-desktop',
  imports: [NgClass, RouterLink, ButtonComponent],
  templateUrl: './error-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDesktopComponent extends ErrorBase {}
