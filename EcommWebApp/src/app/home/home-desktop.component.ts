import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardDesktopComponent, ButtonComponent } from 'ecomm-components';
import { HomeBaseDirective } from './home-base.directive';

@Component({
  selector: 'app-home-desktop',
  imports: [RouterLink, ProductCardDesktopComponent, ButtonComponent],
  templateUrl: './home-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeDesktopComponent extends HomeBaseDirective {}
