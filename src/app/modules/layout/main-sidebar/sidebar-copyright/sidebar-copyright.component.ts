import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { productTypeLabels } from 'app/enums/product-type.enum';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { CopyrightLineComponent } from 'app/modules/layout/copyright-line/copyright-line.component';
import { MainSidebarService } from 'app/modules/layout/main-sidebar/main-sidebar.service';
import { MapValuePipe } from 'app/modules/pipes/map-value/map-value.pipe';
import { AppState } from 'app/store';
import { selectBuildYear, selectProductType, waitForSystemInfo } from 'app/store/system-info/system-info.selectors';

@Component({
  selector: 'ix-sidebar-copyright',
  standalone: true,
  imports: [
    AsyncPipe,
    CopyrightLineComponent,
    IxIconComponent,
    MapValuePipe,
    TranslateModule,
    MatTooltip,
  ],
  templateUrl: './sidebar-copyright.component.html',
  styleUrl: './sidebar-copyright.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarCopyrightComponent {
  private readonly copyrightYear = toSignal(this.store$.select(selectBuildYear));
  private readonly productType = toSignal(this.store$.select(selectProductType));

  protected isSidebarCollapsed = this.sidebarService.isCollapsed;
  protected readonly hostname$ = this.store$.pipe(
    waitForSystemInfo,
    map(({ hostname }) => hostname),
  );

  constructor(
    private store$: Store<AppState>,
    private translate: TranslateService,
    private sidebarService: MainSidebarService,
  ) {}

  protected copyrightTooltip = computed(() => {
    const productType = productTypeLabels.has(this.productType()) ? this.productType() : '';

    return this.translate.instant('{product} {year} by iXsystems, Inc.', {
      product: `TrueNAS ${productType} ® ©`,
      year: this.copyrightYear(),
    });
  });
}
