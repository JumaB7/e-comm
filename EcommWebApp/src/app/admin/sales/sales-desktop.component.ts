import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SalesBaseDirective } from './sales-base.directive';

@Component({
  selector: 'app-sales-desktop',
  imports: [NgClass],
  templateUrl: './sales-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesDesktopComponent extends SalesBaseDirective {}
