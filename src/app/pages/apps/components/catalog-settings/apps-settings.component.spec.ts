import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { fakeSuccessfulJob } from 'app/core/testing/utils/fake-job.utils';
import { mockCall, mockJob, mockApi } from 'app/core/testing/utils/mock-api.utils';
import { mockAuth } from 'app/core/testing/utils/mock-auth.utils';
import { CatalogConfig } from 'app/interfaces/catalog.interface';
import { DockerConfig } from 'app/interfaces/docker-config.interface';
import { DetailsTableHarness } from 'app/modules/details-table/details-table.harness';
import { DialogService } from 'app/modules/dialog/dialog.service';
import { EditableHarness } from 'app/modules/forms/editable/editable.harness';
import { IxCheckboxListHarness } from 'app/modules/forms/ix-forms/components/ix-checkbox-list/ix-checkbox-list.harness';
import { IxChipsHarness } from 'app/modules/forms/ix-forms/components/ix-chips/ix-chips.harness';
import {
  IxIpInputWithNetmaskComponent,
} from 'app/modules/forms/ix-forms/components/ix-ip-input-with-netmask/ix-ip-input-with-netmask.component';
import { IxListHarness } from 'app/modules/forms/ix-forms/components/ix-list/ix-list.harness';
import { FormErrorHandlerService } from 'app/modules/forms/ix-forms/services/form-error-handler.service';
import { IxFormHarness } from 'app/modules/forms/ix-forms/testing/ix-form.harness';
import { SlideInRef } from 'app/modules/slide-ins/slide-in-ref';
import { ApiService } from 'app/modules/websocket/api.service';
import { AppsSettingsComponent } from 'app/pages/apps/components/catalog-settings/apps-settings.component';
import { DockerStore } from 'app/pages/apps/store/docker.store';

describe('AppsSettingsComponent', () => {
  let spectator: Spectator<AppsSettingsComponent>;
  let loader: HarnessLoader;
  let hasNvidiaCard = false;

  const dockerConfig = {
    address_pools: [
      { base: '172.17.0.0/12', size: 12 },
    ],
    enable_image_updates: false,
    secure_registry_mirrors: ['registry1.example.com', 'registry2.example.com'],
    insecure_registry_mirrors: ['insecure.example.com'],
    pool: 'test-pool',
    dataset: 'test-dataset',
    nvidia: false,
  } as DockerConfig;

  const slideInRef: SlideInRef<undefined, unknown> = {
    close: jest.fn(),
    requireConfirmationWhen: jest.fn(),
    getData: jest.fn((): undefined => undefined),
  };

  const createComponent = createComponentFactory({
    component: AppsSettingsComponent,
    imports: [
      ReactiveFormsModule,
      IxIpInputWithNetmaskComponent,
    ],
    providers: [
      mockApi([
        mockCall('catalog.update'),
        mockCall('docker.nvidia_present', () => hasNvidiaCard),
        mockCall('catalog.trains', ['stable', 'community', 'test']),
        mockCall('catalog.config', {
          label: 'TrueNAS',
          preferred_trains: ['test'],
        } as CatalogConfig),
        mockCall('docker.status'),
        mockCall('docker.config', dockerConfig),
        mockJob('docker.update', fakeSuccessfulJob()),
      ]),
      mockProvider(DialogService, {
        jobDialog: jest.fn(() => ({
          afterClosed: () => of(null),
        })),
      }),
      mockProvider(SlideInRef, slideInRef),
      mockProvider(FormErrorHandlerService),
      mockAuth(),
      mockProvider(DockerStore, {
        initialize: jest.fn(),
      }),
    ],
  });

  describe('system has no nvidia card', () => {
    beforeEach(() => {
      hasNvidiaCard = false;
      spectator = createComponent();
      loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    });

    it('loads list of available trains and shows them', async () => {
      expect(spectator.inject(ApiService).call).toHaveBeenCalledWith('catalog.trains');

      const checkboxList = await loader.getHarness(IxCheckboxListHarness);
      const checkboxes = await checkboxList.getCheckboxes();
      expect(checkboxes).toHaveLength(3);
      expect(await checkboxes[0].getLabelText()).toBe('stable');
      expect(await checkboxes[1].getLabelText()).toBe('community');
      expect(await checkboxes[2].getLabelText()).toBe('test');
    });

    it('shows preferred trains when catalog is open for editing', async () => {
      const form = await loader.getHarness(IxFormHarness);
      const values = await form.getValues();

      expect(values).toMatchObject({
        'Preferred Trains': ['test'],
      });
    });

    it('saves catalog updates and reloads catalog apps when form is saved', async () => {
      const form = await loader.getHarness(IxFormHarness);
      await form.fillForm({
        'Preferred Trains': ['stable', 'community'],
      });

      const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
      await saveButton.click();

      expect(spectator.inject(ApiService).call).toHaveBeenCalledWith('catalog.update', [
        { preferred_trains: ['stable', 'community'] },
      ]);
    });
  });

  describe('has nvidia card', () => {
    beforeEach(() => {
      hasNvidiaCard = true;
      spectator = createComponent();
      loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    });

    it('shows Install NVIDIA Drivers checkbox when nvidia card is present', async () => {
      const form = await loader.getHarness(IxFormHarness);
      const values = await form.getValues();

      expect(values).toMatchObject({
        'Install NVIDIA Drivers': false,
        'Preferred Trains': ['test'],
      });
    });

    it('saves catalog updates and nvidia settings', async () => {
      const form = await loader.getHarness(IxFormHarness);
      await form.fillForm({
        'Preferred Trains': ['stable'],
        'Install NVIDIA Drivers': true,
      });

      const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
      await saveButton.click();

      expect(spectator.inject(ApiService).job).toHaveBeenCalledWith('docker.update', [
        expect.objectContaining({
          nvidia: true,
        }),
      ]);
    });

    describe('other docker settings', () => {
      beforeEach(() => {
        hasNvidiaCard = false;
        spectator = createComponent();
        loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      });

      it('shows other current docker settings', async () => {
        const form = await loader.getHarness(IxFormHarness);
        const values = await form.getValues();

        expect(values).toMatchObject({
          'Check for docker image updates': false,
          Base: '172.17.0.0/12',
          Size: '12',
        });

        const detailsTable = await loader.getHarness(DetailsTableHarness);
        const mirrorItem = await detailsTable.getItemByLabel('Registry Mirrors');
        const mirrorValue = await mirrorItem.getValueText();

        expect(mirrorValue).toContain('3 mirrors');
      });

      it('updates docker settings when form is edited', async () => {
        const form = await loader.getHarness(IxFormHarness);
        await form.fillForm({
          'Check for docker image updates': true,
        });

        const addressPoolList = await loader.getHarness(IxListHarness.with({ label: 'Address Pools' }));

        await addressPoolList.pressAddButton();

        const newAddressPool = await addressPoolList.getLastListItem();
        await newAddressPool.fillForm({
          Base: '173.17.0.0/12',
          Size: 12,
        });

        const detailsTable = await loader.getHarness(DetailsTableHarness);
        const mirrorItem = await detailsTable.getItemByLabel('Registry Mirrors');
        const editable = await mirrorItem.getHarness(EditableHarness);

        await editable.open();

        const secureChips = await editable.getHarness(IxChipsHarness.with({ label: 'Secure Mirror URLs' }));
        await secureChips.setValue(['new-secure.example.com']);

        const insecureChips = await editable.getHarness(IxChipsHarness.with({ label: 'Insecure Mirror URLs' }));
        await insecureChips.setValue(['new-insecure.example.com']);

        await editable.tryToClose();

        const saveButton = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
        await saveButton.click();

        expect(spectator.inject(ApiService).job).toHaveBeenCalledWith('docker.update', [{
          enable_image_updates: true,
          address_pools: [
            { base: '172.17.0.0/12', size: 12 },
            { base: '173.17.0.0/12', size: 12 },
          ],
          nvidia: false,
          secure_registry_mirrors: ['new-secure.example.com'],
          insecure_registry_mirrors: ['new-insecure.example.com'],
        }]);
      });
    });
  });
});
