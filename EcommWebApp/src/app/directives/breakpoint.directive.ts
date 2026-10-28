import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of } from 'rxjs';

export type BreakpointType = 'mobile' | 'desktop';

@Directive({
  selector: '[appBreakpoint]',
})
export class BreakpointDirective {
  readonly appBreakpoint = input.required<BreakpointType>();

  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly device = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map((state) => (state.matches ? 'mobile' : 'desktop') satisfies BreakpointType),
      distinctUntilChanged(),
      catchError(() => of<BreakpointType>('desktop')),
    ),
    { initialValue: this.breakpointObserver.isMatched(Breakpoints.Handset) ? 'mobile' : 'desktop' },
  );

  constructor() {
    effect(() => {
      const wanted = this.appBreakpoint();
      if (wanted !== 'mobile' && wanted !== 'desktop') {
        throw new Error(`The value supplied for 'appBreakpoint' must be mobile or desktop.`);
      }
      this.viewContainer.clear();
      if (wanted !== this.device()) {
        return;
      }
      this.viewContainer.createEmbeddedView(this.templateRef);
    });
  }
}
