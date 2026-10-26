import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HomeDesktopComponent } from './home-desktop.component';
import { HomeMobileComponent } from './home-mobile.component';
import { ScopeIntroComponent } from './scope-intro.component';
import { ViewportService } from '../services/viewport.service';

const introKey = 'veld-scope-intro';

function shouldPlayIntro(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  try {
    return sessionStorage.getItem(introKey) !== 'seen';
  } catch {
    return true;
  }
}

@Component({
  selector: 'app-home',
  imports: [NgClass, HomeDesktopComponent, HomeMobileComponent, ScopeIntroComponent],
  template: `
    @if (playIntro()) {
      <app-scope-intro (finished)="dismiss()" />
    }
    <div [ngClass]="playIntro() ? 'animate-site-pop' : ''">
      @if (isMobile()) {
        <app-home-mobile />
      } @else {
        <app-home-desktop />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeContainerComponent {
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;
  readonly playIntro = signal(shouldPlayIntro());

  dismiss(): void {
    try {
      sessionStorage.setItem(introKey, 'seen');
    } catch {
      // Private browsing can block storage. The intro still closes.
    }
    this.playIntro.set(false);
  }
}
