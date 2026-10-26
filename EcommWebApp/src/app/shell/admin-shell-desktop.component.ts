import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminShellBaseDirective } from './admin-shell-base.directive';

@Component({
  selector: 'app-admin-shell-desktop',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-shell-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellDesktopComponent extends AdminShellBaseDirective {}
