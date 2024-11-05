import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import { sidenavToggled } from 'app/store/topbar/topbar.actions';

@Injectable({
  providedIn: 'root',
})
export class MainSidebarService {
  readonly isCollapsed = signal(false);
  readonly isOpenOnMobile = signal(false);

  private readonly isXsScreen = signal(false);

  constructor(
    private store$: Store<AppState>,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.listenToScreenSizeChanges();
  }

  onTogglePressed(): void {
    if (this.isXsScreen()) {
      this.isOpenOnMobile.set(!this.isOpenOnMobile());
      return;
    }

    this.isCollapsed.set(!this.isCollapsed());
    this.store$.dispatch(sidenavToggled({
      isCollapsed: this.isCollapsed(),
    }));
  }

  private listenToScreenSizeChanges(): void {
    this.breakpointObserver.observe(Breakpoints.XSmall).subscribe((breakpoints) => {
      const isXsScreen = breakpoints.matches;

      this.isXsScreen.set(isXsScreen);
      this.isOpenOnMobile.set(false);
    });
  }
}
