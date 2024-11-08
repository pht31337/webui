import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { computed, Injectable, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import { sidenavToggled } from 'app/store/topbar/topbar.actions';

@Injectable({
  providedIn: 'root',
})
export class MainSidebarService {
  readonly isOpenOnMobile = signal(false);
  readonly isCollapsed = computed(() => {
    return this.isCollapsedOnDesktop() && !this.isSmScreen();
  });

  private readonly isSmScreen = signal(false);
  private readonly isCollapsedOnDesktop = signal(false);

  constructor(
    private store$: Store<AppState>,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.listenToScreenSizeChanges();
  }

  onTogglePressed(): void {
    if (this.isSmScreen()) {
      this.isOpenOnMobile.set(!this.isOpenOnMobile());
      return;
    }

    this.isCollapsedOnDesktop.set(!this.isCollapsedOnDesktop());

    // TODO: Nuke store for this.
    this.store$.dispatch(sidenavToggled({
      isCollapsed: this.isCollapsedOnDesktop(),
    }));
  }

  private listenToScreenSizeChanges(): void {
    this.breakpointObserver.observe(Breakpoints.Small).subscribe((breakpoints) => {
      const isSmScreen = breakpoints.matches;

      this.isSmScreen.set(isSmScreen);
      this.isOpenOnMobile.set(false);
    });
  }
}
