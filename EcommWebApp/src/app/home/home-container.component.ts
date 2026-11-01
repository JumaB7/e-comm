import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { SessionStoreService } from '../services/session-store.service';
import { HomeDesktopComponent } from './home-desktop.component';
import { HomeMobileComponent } from './home-mobile.component';
import { ScopeIntroComponent } from './scope-intro.component';

@Component({
  selector: 'app-home',
  imports: [NgClass, BreakpointDirective, HomeDesktopComponent, HomeMobileComponent, ScopeIntroComponent],
  template: `
    @if (playIntro()) {
      <app-scope-intro (finished)="dismiss()" />
    }
    <div [ngClass]="playIntro() ? 'animate-site-pop' : ''">
      <app-home-desktop *appBreakpoint="'desktop'" />
      <app-home-mobile *appBreakpoint="'mobile'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeContainerComponent {
  private readonly session = inject(SessionStoreService);
  readonly playIntro = signal(this.session.shouldPlayScopeIntro());

  dismiss(): void {
    this.session.markScopeIntroSeen();
    this.playIntro.set(false);
  }
}
