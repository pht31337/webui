import { NgClass, AsyncPipe, LowerCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component, ElementRef,
  OnDestroy,
  OnInit, ViewChild,
} from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AlertsPanelComponent } from 'app/modules/alerts/components/alerts-panel/alerts-panel.component';
import { alertPanelClosed } from 'app/modules/alerts/store/alert.actions';
import { selectIsAlertPanelOpen } from 'app/modules/alerts/store/alert.selectors';
import { iconMarker } from 'app/modules/ix-icon/icon-marker.util';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { ConsoleFooterComponent } from 'app/modules/layout/console-footer/console-footer.component';
import { CopyrightLineComponent } from 'app/modules/layout/copyright-line/copyright-line.component';
import { MainSidebarComponent } from 'app/modules/layout/main-sidebar/main-sidebar.component';
import { MainMenuComponent } from 'app/modules/layout/main-sidebar/navigation/main-menu.component';
import { TopbarComponent } from 'app/modules/layout/topbar/topbar.component';
import { DefaultPageHeaderComponent } from 'app/modules/page-header/default-page-header/default-page-header.component';
import { MapValuePipe } from 'app/modules/pipes/map-value/map-value.pipe';
import { ChainedSlideInComponent } from 'app/modules/slide-ins/components/chained-slide-in/chained-slide-in.component';
import { SlideInComponent } from 'app/modules/slide-ins/slide-in.component';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { LanguageService } from 'app/services/language.service';
import { SentryService } from 'app/services/sentry.service';
import { SessionTimeoutService } from 'app/services/session-timeout.service';
import { ThemeService } from 'app/services/theme/theme.service';
import { AppState } from 'app/store';
import { selectHasConsoleFooter, waitForGeneralConfig } from 'app/store/system-config/system-config.selectors';

@UntilDestroy()
@Component({
  selector: 'ix-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatSidenavContainer,
    MatSidenav,
    NgClass,
    RouterLink,
    IxIconComponent,
    MainMenuComponent,
    MatTooltip,
    CopyrightLineComponent,
    MatSidenavContent,
    TopbarComponent,
    DefaultPageHeaderComponent,
    RouterOutlet,
    ConsoleFooterComponent,
    AlertsPanelComponent,
    SlideInComponent,
    ChainedSlideInComponent,
    AsyncPipe,
    LowerCasePipe,
    TranslateModule,
    MapValuePipe,
    TestDirective,
    MainSidebarComponent,
  ],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('main', { static: true }) mainElement: ElementRef<HTMLElement>;

  readonly isAlertPanelOpen$ = this.store$.select(selectIsAlertPanelOpen);
  readonly hasConsoleFooter$ = this.store$.select(selectHasConsoleFooter);

  constructor(
    private themeService: ThemeService,
    private store$: Store<AppState>,
    private languageService: LanguageService,
    private sessionTimeoutService: SessionTimeoutService,
    private sentryService: SentryService,
  ) {}

  ngOnInit(): void {
    performance.mark('Admin Init');
    performance.measure('Login', 'Login Start', 'Admin Init');
    this.sessionTimeoutService.start();
    this.themeService.loadTheme$.next('');
    this.sentryService.init();
    this.store$.pipe(waitForGeneralConfig, untilDestroyed(this)).subscribe((config) => {
      this.languageService.setLanguage(config.language);
    });
  }

  ngOnDestroy(): void {
    this.sessionTimeoutService.stop();
  }

  focusOnMain(): void {
    this.mainElement.nativeElement.focus();
    this.mainElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  onAlertsPanelClosed(): void {
    this.store$.dispatch(alertPanelClosed());
  }

  protected readonly iconMarker = iconMarker;
}
