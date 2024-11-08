import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, input, signal,
} from '@angular/core';
import { MatNavList } from '@angular/material/list';
import { UntilDestroy } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { MenuItem, MenuItemType } from 'app/interfaces/menu-item.interface';
import { MenuItemComponent } from 'app/modules/layout/main-sidebar/navigation/menu-item/menu-item.component';
import {
  SecondaryMenuComponent,
} from 'app/modules/layout/main-sidebar/navigation/secondary-menu/secondary-menu.component';
import { NavigationService } from 'app/services/navigation/navigation.service';

@UntilDestroy()
@Component({
  selector: 'ix-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatNavList,
    TranslateModule,
    MenuItemComponent,
    AsyncPipe,
    SecondaryMenuComponent,
  ],
})
export class MainMenuComponent {
  readonly collapsed = input(false);

  readonly secondaryMenuOpenedFor = signal<MenuItem | null>(null);

  protected readonly menuItems = this.navService.menuItems;

  constructor(
    private navService: NavigationService,
  ) {}

  protected onItemClicked(item: MenuItem): void {
    if (item.type !== MenuItemType.SlideOut) {
      return;
    }

    if (this.secondaryMenuOpenedFor() === item) {
      this.secondaryMenuOpenedFor.set(null);
      return;
    }

    this.secondaryMenuOpenedFor.set(item);
  }
}
