import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, signal } from '@angular/core';
import { MatDrawerMode, MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { SubMenuItem } from 'app/interfaces/menu-item.interface';
import { AppState } from 'app/store';

export const collapsedMenuClass = 'collapsed-menu';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  sidenav: MatSidenav;
  isOpen = true;
  // TODO: How is this different from isMenuCollapsed?
  isCollapsed = false;
  mode: MatDrawerMode = 'over';
  isOpenSecondaryMenu = false;
  menuName: string;
  subs: SubMenuItem[];

  get sidenavWidth(): string {
    const iconified = this.isMenuCollapsed;
    if (this.isOpen && iconified && this.mode === 'side') {
      return '48px';
    }
    if (this.isOpen && !iconified && this.mode === 'side') {
      return '240px';
    }
    return '0px';
  }

  readonly isMobile = signal(false);

  get isMenuCollapsed(): boolean {
    return document.getElementsByClassName(collapsedMenuClass).length === 1;
  }

  set isMenuCollapsed(isCollapsed: boolean) {
    const appBody = document.body;

    if (isCollapsed) {
      appBody.classList.add(collapsedMenuClass);
    } else {
      appBody.classList.remove(collapsedMenuClass);
    }

    for (const element of document.getElementsByClassName('has-submenu') as HTMLCollectionOf<HTMLElement>) {
      element.classList.remove('open');
    }
  }

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private store$: Store<AppState>,
    private actions$: Actions,
  ) {
    this.listenForScreenSizeChanges();
    this.listenForRouteChanges();
    this.listenForSidenavIndicatorPressed();
  }

  setSidenav(sidenav: MatSidenav): void {
    this.sidenav = sidenav;
  }

  toggleSecondaryMenu(menuInfo?: [string, SubMenuItem[]]): void {
    const [state, subItems] = menuInfo || [];
    if ((this.isOpenSecondaryMenu && !menuInfo) || (this.isOpenSecondaryMenu && state === this.menuName)) {
      this.isOpenSecondaryMenu = false;
      this.subs = [];
    } else if (menuInfo) {
      this.menuName = state;
      this.subs = subItems;
      this.isOpenSecondaryMenu = true;
    }
  }

  closeSecondaryMenu(): void {
    this.isOpenSecondaryMenu = false;
  }

  private listenForScreenSizeChanges(): void {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(untilDestroyed(this))
      .subscribe((state) => {
        const isMobile = state.matches;
        this.isMobile.set(isMobile);
        this.isOpen = !isMobile;
        this.mode = isMobile ? 'over' : 'side';
      });
  }

  private listenForSidenavIndicatorPressed(): void {
    // this.actions$
    //   .pipe(
    //     ofType(sidenavIndicatorPressed),
    //     distinctUntilChanged(),
    //   ).subscribe(() => {
    //     this.toggleSidenav();
    //   });
  }

  private listenForRouteChanges(): void {
    this.router.events.pipe(
      filter((routeChange) => routeChange instanceof NavigationEnd && this.isMobile()),
    ).subscribe(() => {
      this.sidenav?.close();
    });
  }
}
