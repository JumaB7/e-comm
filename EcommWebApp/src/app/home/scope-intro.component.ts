import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-scope-intro',
  templateUrl: './scope-intro.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScopeIntroComponent {
  readonly finished = output<void>();
  private closed = false;

  close(): void {
    if (this.closed) {
      return;
    }
    this.closed = true;
    this.finished.emit();
  }

  onFadeEnd(event: AnimationEvent): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    this.close();
  }
}
