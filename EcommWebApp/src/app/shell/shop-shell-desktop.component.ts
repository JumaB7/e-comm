import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ShopShellBaseDirective } from './shop-shell-base.directive';

@Component({
  selector: 'app-shop-shell-desktop',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './shop-shell-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopShellDesktopComponent extends ShopShellBaseDirective {}
