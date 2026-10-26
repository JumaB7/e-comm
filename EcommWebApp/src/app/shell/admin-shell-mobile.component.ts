import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminShellBaseDirective } from './admin-shell-base.directive';

@Component({
  selector: 'app-admin-shell-mobile',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-shell-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellMobileComponent extends AdminShellBaseDirective {}
