import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HasAccessDirective } from 'app/directives/has-access/has-access.directive';
import { SubMenuItem } from 'app/interfaces/menu-item.interface';
import { TestDirective } from 'app/modules/test-id/test.directive';

@Component({
  selector: 'ix-secondary-menu',
  standalone: true,
  imports: [
    AsyncPipe,
    HasAccessDirective,
    MatList,
    MatListItem,
    RouterLinkActive,
    TranslateModule,
    TestDirective,
    RouterLink,
  ],
  templateUrl: './secondary-menu.component.html',
  styleUrl: './secondary-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondaryMenuComponent {
  readonly menuName = input<string>();
  readonly subMenuItems = input<SubMenuItem[]>();
}
