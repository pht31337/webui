import { fakeAsync } from '@angular/core/testing';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { of } from 'rxjs';
import { NetworkInterfaceType, NetworkInterfaceAliasType, LinkState } from 'app/enums/network-interface.enum';
import { InterfaceStatusIconComponent } from 'app/modules/interface-status-icon/interface-status-icon.component';
import { NetworkSpeedPipe } from 'app/modules/pipes/network-speed/network-speed.pipe';
import { WidgetResourcesService } from 'app/pages/dashboard/services/widget-resources.service';
import { SlotSize } from 'app/pages/dashboard/types/widget.interface';
import { NetworkChartComponent } from 'app/pages/dashboard/widgets/network/common/network-chart/network-chart.component';
import { WidgetNetworkComponent } from 'app/pages/dashboard/widgets/network/widget-network/widget-network.component';
import { ThemeService } from 'app/services/theme/theme.service';

describe('WidgetNetworkComponent', () => {
  let spectator: Spectator<WidgetNetworkComponent>;
  const createComponent = createComponentFactory({
    component: WidgetNetworkComponent,
    imports: [
      NgxSkeletonLoaderModule,
      NetworkSpeedPipe,
    ],
    declarations: [
      MockComponent(NetworkChartComponent),
      MockComponent(InterfaceStatusIconComponent),
    ],
    providers: [
      mockProvider(WidgetResourcesService, {
        networkInterfaces$: of({
          value: [
            {
              id: '1',
              type: NetworkInterfaceType.Physical,
              name: 'ens1',
              aliases: [
                {
                  address: '192.168.238.12',
                  netmask: 24,
                  type: NetworkInterfaceAliasType.Inet,
                },
              ],
              state: {
                link_state: LinkState.Up,
                active_media_subtype: '100Mb/s MII',
                active_media_type: 'Ethernet',
                vlans: [],
                aliases: [],
              },
            },
          ],
          isLoading: false,
          error: null,
        }),
        realtimeUpdates$: of({
          fields: {
            interfaces: {
              ens1: {
                received_bytes_rate: 2048,
                sent_bytes_rate: 4096,
                link_state: LinkState.Up,
              },
            },
          },
        }),
        networkInterfaceUpdate: jest.fn(() => of([
          {
            name: 'interface',
            identifier: 'ens1',
            data: [
              [0, 7728.161792, 992.3273728],
              [0, 8728.161792, 1992.3273728],
            ],
            legend: ['time', 'received', 'sent'],
            start: 1714583020,
            end: 1714586620,
            aggregations: {
              min: {
                received: 0,
                sent: 0.3679756,
              },
              mean: {
                received: 2.9719816804221155,
                sent: 29.53915262221609,
              },
              max: {
                received: 68.91254,
                sent: 258.6983,
              },
            },
          },
        ])),
      }),
      mockProvider(ThemeService, {
        currentTheme: jest.fn(() => ({
          blue: 'blue',
          orange: 'orange',
        })),
      }),
    ],
  });

  describe('Full Size', () => {
    beforeEach(() => {
      spectator = createComponent({
        props: {
          size: SlotSize.Full,
          settings: {
            interface: 'ens1',
          },
        },
      });
    });

    it('shows widget header', () => {
      expect(spectator.query('.header')).toHaveText('Network');
    });

    it('shows interface name', () => {
      expect(spectator.query('.info-header-title')).toHaveText('ens1');
    });

    it('shows interface state', fakeAsync(() => {
      spectator.tick(1);
      expect(spectator.query('.info-list-item.state')).toHaveText('LINK STATE UP');
    }));

    it('shows interface traffic', fakeAsync(() => {
      spectator.tick(1);
      expect(spectator.query('.info-list-item.in')).toHaveText('In:16.38 kb/s');
      expect(spectator.query('.info-list-item.out')).toHaveText('Out:32.77 kb/s');
    }));

    it('shows a chart with network traffic', fakeAsync(() => {
      spectator.tick(1);
      const chart = spectator.query(NetworkChartComponent);
      expect(chart).not.toBeNull();

      const data = chart.data;
      expect(data).toMatchObject({
        datasets: [
          {
            pointBackgroundColor: 'blue',
            backgroundColor: 'blue',
            borderColor: 'blue',
            fill: true,
            label: 'Incoming [ens1]',
            pointRadius: 0,
            tension: 0.2,
            data: [
              { x: 1714583020000, y: 7728161.791999999 },
              { x: 1714583021000, y: 8728161.792000001 },
            ],
          },
          {
            pointBackgroundColor: 'orange',
            backgroundColor: 'orange',
            borderColor: 'orange',
            fill: true,
            label: 'Outgoing [ens1]',
            pointRadius: 0,
            tension: 0.2,
            data: [
              { x: 1714583020000, y: -992327.3728 },
              { x: 1714583021000, y: -1992327.3728 },
            ],
          },
        ],
      });
    }));

    it('shows a message to configure widget', () => {
      spectator.setInput('settings', null);
      expect(spectator.query('.icon')).toExist();
      expect(spectator.query('h3 div')).toHaveText('Widget is not configured.');
      expect(spectator.query('h3 small')).toHaveText('Edit widget to choose network interface.');
    });
  });

  describe('Half Size', () => {
    beforeEach(() => {
      spectator = createComponent({
        props: {
          size: SlotSize.Half,
          settings: {
            interface: 'ens1',
          },
        },
      });
    });

    it('ensures no widget header is rendered', () => {
      expect(spectator.query('.header')).toBeNull();
    });

    it('shows interface name', () => {
      expect(spectator.query('.info-header-title')).toHaveText('ens1');
    });

    it('shows interface state', fakeAsync(() => {
      spectator.tick(1);
      expect(spectator.query('.info-list-item.state')).toHaveText('LINK STATE UP');
    }));

    it('shows interface traffic', fakeAsync(() => {
      spectator.tick(1);
      expect(spectator.query('.info-list-item.in')).toHaveText('In:16.38 kb/s');
      expect(spectator.query('.info-list-item.out')).toHaveText('Out:32.77 kb/s');
    }));

    it('shows a chart with network traffic', fakeAsync(() => {
      spectator.tick(1);
      const chart = spectator.query(NetworkChartComponent);
      expect(chart).not.toBeNull();

      const data = chart.data;
      expect(data).toMatchObject({
        datasets: [
          {
            pointBackgroundColor: 'blue',
            backgroundColor: 'blue',
            borderColor: 'blue',
            fill: true,
            label: 'Incoming [ens1]',
            pointRadius: 0,
            tension: 0.2,
            data: [
              { x: 1714583020000, y: 7728161.791999999 },
              { x: 1714583021000, y: 8728161.792000001 },
            ],
          },
          {
            pointBackgroundColor: 'orange',
            backgroundColor: 'orange',
            borderColor: 'orange',
            fill: true,
            label: 'Outgoing [ens1]',
            pointRadius: 0,
            tension: 0.2,
            data: [
              { x: 1714583020000, y: -992327.3728 },
              { x: 1714583021000, y: -1992327.3728 },
            ],
          },
        ],
      });
    }));
  });

  describe('Quarter Size', () => {
    beforeEach(() => {
      spectator = createComponent({
        props: {
          size: SlotSize.Quarter,
          settings: {
            interface: 'ens1',
          },
        },
      });
    });

    it('ensures no widget header is rendered', () => {
      expect(spectator.query('.header')).toBeNull();
    });

    it('shows interface name', () => {
      expect(spectator.query('.info-header-title')).toHaveText('ens1');
    });

    it('shows interface state', fakeAsync(() => {
      spectator.tick(1);
      expect(spectator.query('.info-list-item.state')).toHaveText('LINK STATE UP');
    }));

    it('shows interface traffic', fakeAsync(() => {
      spectator.tick(1);
      expect(spectator.query('.info-list-item.in')).toHaveText('In:16.38 kb/s');
      expect(spectator.query('.info-list-item.out')).toHaveText('Out:32.77 kb/s');
    }));

    it('ensures chart is not rendered', fakeAsync(() => {
      spectator.tick(1);
      const chart = spectator.query(NetworkChartComponent);
      expect(chart).toBeNull();
    }));
  });
});
