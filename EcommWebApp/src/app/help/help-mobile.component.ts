import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HelpBase } from './help-base';

@Component({
  selector: 'app-help-mobile',
  imports: [RouterLink],
  templateUrl: './help-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpMobileComponent extends HelpBase {}
