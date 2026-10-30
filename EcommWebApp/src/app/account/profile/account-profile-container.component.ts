import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../../directives/breakpoint.directive';
import { AccountProfileDesktopComponent } from './account-profile-desktop.component';
import { AccountProfileMobileComponent } from './account-profile-mobile.component';

@Component({
  selector: 'app-account-profile',
  imports: [BreakpointDirective, AccountProfileDesktopComponent, AccountProfileMobileComponent],
  template: `
    <app-account-profile-desktop *appBreakpoint="'desktop'" />
    <app-account-profile-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountProfileContainerComponent {}
