import { Injectable } from '@angular/core';
import { marker as T } from '@biesbjerg/ngx-translate-extract-marker';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LicenseFeature } from 'app/enums/license-feature.enum';
import { ProductType } from 'app/enums/product-type.enum';
import { MenuItem, MenuItemType } from 'app/interfaces/menu-item.interface';
import { iconMarker } from 'app/modules/ix-icon/icon-marker.util';
import { AuthService } from 'app/services/auth/auth.service';
import { SystemGeneralService } from 'app/services/system-general.service';
import { AppState } from 'app/store';
import { selectIsHaLicensed } from 'app/store/ha-info/ha-info.selectors';
import { selectHasEnclosureSupport, waitForSystemInfo } from 'app/store/system-info/system-info.selectors';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  readonly hasFailover$ = this.store$.select(selectIsHaLicensed);
  readonly hasEnclosure$ = this.store$.select(selectHasEnclosureSupport);
  readonly hasVms$ = new BehaviorSubject(false);
  readonly hasApps$ = new BehaviorSubject(false);

  readonly menuItems: MenuItem[] = [
    {
      name: T('Dashboard'),
      type: MenuItemType.Link,
      icon: iconMarker('dashboard'),
      state: 'dashboard',
    },
    {
      name: T('Storage'),
      type: MenuItemType.Link,
      icon: iconMarker('dns'),
      state: 'storage',
    },
    {
      name: T('Datasets'),
      type: MenuItemType.Link,
      icon: iconMarker('ix-dataset-root'),
      state: 'datasets',
    },
    {
      name: T('Shares'),
      type: MenuItemType.Link,
      icon: iconMarker('folder_shared'),
      state: 'sharing',
    },
    {
      name: T('Data Protection'),
      type: MenuItemType.Link,
      icon: iconMarker('security'),
      state: 'data-protection',
    },
    {
      name: T('Network'),
      type: MenuItemType.Link,
      icon: iconMarker('device_hub'),
      state: 'network',
    },
    {
      name: T('Credentials'),
      type: MenuItemType.SlideOut,
      icon: iconMarker('vpn_key'),
      sub: [
        { name: T('Users'), state: 'credentials/users' },
        { name: T('Groups'), state: 'credentials/groups' },
        { name: T('Directory Services'), state: 'credentials/directory-services' },
        { name: T('Backup Credentials'), state: 'credentials/backup-credentials' },
        { name: T('Certificates'), state: 'credentials/certificates' },
        {
          name: 'KMIP',
          state: 'credentials/kmip',
          isVisible$: of(this.systemGeneralService.getProductType() === ProductType.ScaleEnterprise),
        },
      ],
    },
    {
      name: T('Virtualization'),
      type: MenuItemType.Link,
      icon: iconMarker('computer'),
      state: 'vm',
      isVisible$: this.hasVms$,
    },
    {
      name: T('Containers (WIP)'),
      type: MenuItemType.Link,
      icon: iconMarker('computer'),
      state: 'virtualization',
      isVisible$: this.hasVms$,
    },
    {
      name: T('Apps'),
      type: MenuItemType.Link,
      icon: iconMarker('apps'),
      state: 'apps',
      isVisible$: this.hasApps$,
    },
    {
      name: T('Reporting'),
      type: MenuItemType.Link,
      icon: iconMarker('insert_chart'),
      state: 'reportsdashboard/cpu',
    },
    {
      name: T('System'),
      type: MenuItemType.SlideOut,
      icon: iconMarker('settings'),
      sub: [
        { name: T('Update'), state: 'system/update' },
        { name: T('General Settings'), state: 'system/general' },
        { name: T('Advanced Settings'), state: 'system/advanced' },
        { name: T('Boot'), state: 'system/boot' },
        { name: T('Failover'), state: 'system/failover', isVisible$: this.hasFailover$ },
        { name: T('Services'), state: 'system/services' },
        {
          name: T('Shell'),
          state: 'system/shell',
          hasAccess$: this.authService.user$.pipe(map((user) => user?.privilege?.web_shell)),
        },
        { name: T('Alert Settings'), state: 'system/alert-settings' },
        { name: T('Audit'), state: 'system/audit' },
        { name: T('Enclosure'), state: 'system/viewenclosure', isVisible$: this.hasEnclosure$ },
      ],
    },
  ];

  constructor(
    private store$: Store<AppState>,
    private systemGeneralService: SystemGeneralService,
    private authService: AuthService,
  ) {
    this.checkForEnterpriseLicenses();
  }

  private checkForEnterpriseLicenses(): void {
    if (this.systemGeneralService.getProductType() !== ProductType.ScaleEnterprise) {
      this.hasVms$.next(true);
      this.hasApps$.next(true);
      return;
    }

    this.store$.pipe(waitForSystemInfo, untilDestroyed(this))
      .subscribe((systemInfo) => {
        const hasVms = systemInfo.license && Boolean(systemInfo.license.features.includes(LicenseFeature.Vm));
        this.hasVms$.next(hasVms);

        const hasApps = systemInfo.license && Boolean(systemInfo.license.features.includes(LicenseFeature.Jails));
        this.hasApps$.next(hasApps);
      });
  }
}
