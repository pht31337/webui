import {
  ChangeDetectionStrategy, Component, computed, input,
} from '@angular/core';
import { MatListItem } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { right } from '@popperjs/core';
import { MenuItem, MenuItemType } from 'app/interfaces/menu-item.interface';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { TestDirective } from 'app/modules/test-id/test.directive';

@Component({
  selector: 'ix-menu-item',
  standalone: true,
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
  imports: [
    IxIconComponent,
    TranslateModule,
    MatTooltip,
    TestDirective,
    MatListItem,
    RouterLinkActive,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  readonly item = input.required<MenuItem>();
  readonly collapsed = input(false);

  protected readonly hasSubmenu = computed(() => this.item().type === MenuItemType.SlideOut);

  protected readonly routerLink = computed(() => {
    return ['/', ...this.item().state.split('/')];
  });
  protected readonly right = right;
}
