import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HelpBase } from './help-base';

@Component({
  selector: 'app-help-desktop',
  imports: [RouterLink],
  templateUrl: './help-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpDesktopComponent extends HelpBase {}
