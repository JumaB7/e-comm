import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, ProductCardMobileComponent } from 'ecomm-components';
import { HomeBaseDirective } from './home-base.directive';

@Component({
  selector: 'app-home-mobile',
  imports: [RouterLink, ButtonComponent, ProductCardMobileComponent],
  templateUrl: './home-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeMobileComponent extends HomeBaseDirective {}
