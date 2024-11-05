import {
  ChangeDetectionStrategy, Component, HostBinding,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MainLogoComponent } from 'app/modules/layout/main-sidebar/main-logo/main-logo.component';
import { MainSidebarService } from 'app/modules/layout/main-sidebar/main-sidebar.service';
import { MainMenuComponent } from 'app/modules/layout/main-sidebar/navigation/main-menu.component';
import {
  SidebarCopyrightComponent,
} from 'app/modules/layout/main-sidebar/sidebar-copyright/sidebar-copyright.component';
import { TestDirective } from 'app/modules/test-id/test.directive';

@Component({
  selector: 'ix-main-sidebar',
  templateUrl: './main-sidebar.component.html',
  styleUrls: ['./main-sidebar.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MainMenuComponent,
    MainLogoComponent,
    SidebarCopyrightComponent,
    TranslateModule,
    TestDirective,
  ],
})
export class MainSidebarComponent {
  protected isSidebarCollapsed = this.sidebarService.isCollapsed;

  constructor(
    private sidebarService: MainSidebarService,
  ) {}

  @HostBinding('class.collapsed')
  get isCollapsed(): boolean {
    return this.isSidebarCollapsed();
  }
}
