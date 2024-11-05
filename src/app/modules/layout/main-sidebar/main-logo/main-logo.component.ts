import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { iconMarker } from 'app/modules/ix-icon/icon-marker.util';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { MainMenuComponent } from 'app/modules/layout/main-sidebar/navigation/main-menu.component';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { ThemeService } from 'app/services/theme/theme.service';

@Component({
  selector: 'ix-main-logo',
  standalone: true,
  imports: [
    IxIconComponent,
    RouterLink,
    TestDirective,
    MainMenuComponent,
  ],
  templateUrl: './main-logo.component.html',
  styleUrl: './main-logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class MainLogoComponent {
  readonly collapsed = input(false);

  protected readonly iconMarker = iconMarker;

  // TODO: This may be an isDarkTheme
  isDefaultTheme = this.themeService.isDefaultTheme;

  constructor(
    private themeService: ThemeService,
  ) {}
}
