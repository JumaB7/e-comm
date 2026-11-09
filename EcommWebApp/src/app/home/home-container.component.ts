import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { scopeIntroKey } from '../models/constants';
import { SpinnerService } from '../services/spinner.service';
import { HomeDesktopComponent } from './home-desktop.component';
import { HomeMobileComponent } from './home-mobile.component';
import { ScopeIntroComponent } from './scope-intro.component';

function shouldPlayIntro(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  try {
    return sessionStorage.getItem(scopeIntroKey) !== 'seen';
  } catch {
    return true;
  }
}

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
  private readonly spinner = inject(SpinnerService);
  readonly playIntro = signal(shouldPlayIntro());

  constructor() {
    if (this.playIntro()) {
      this.spinner.suppressOverlay(true);
    }
  }

  dismiss(): void {
    try {
      sessionStorage.setItem(scopeIntroKey, 'seen');
    } catch {
      // Private browsing can block storage. The intro still closes.
    }
    this.spinner.suppressOverlay(false);
    this.playIntro.set(false);
  }
}
