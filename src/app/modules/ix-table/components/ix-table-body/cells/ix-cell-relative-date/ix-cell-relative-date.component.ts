import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isValid } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { formatDistanceToNowShortened } from 'app/helpers/format-distance-to-now-shortened';
import { Column, ColumnComponent } from 'app/modules/ix-table/interfaces/table-column.interface';
import { FormatDateTimePipe } from 'app/modules/pipes/format-date-time/format-datetime.pipe';
import { LocaleService } from 'app/services/locale.service';

@Component({
  selector: 'ix-cell-relative-date',
  templateUrl: './ix-cell-relative-date.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IxCellRelativeDateComponent<T> extends ColumnComponent<T> {
  translate: TranslateService;
  localeService: LocaleService;
  formatDateTime: FormatDateTimePipe;
  defaultTz: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  machineTimezone: string;

  constructor() {
    super();
    this.translate = inject(TranslateService);
    this.formatDateTime = inject(FormatDateTimePipe);
    this.localeService = inject(LocaleService);
    this.machineTimezone = this.localeService.timezone;
  }

  get machineTime(): Date {
    const utc = zonedTimeToUtc(this.value as number, this.defaultTz);
    return utcToZonedTime(utc, this.machineTimezone);
  }

  get isTimezoneDifference(): boolean {
    return this.machineTime < this.value || this.machineTime > this.value;
  }

  get date(): string {
    if (!this.value) {
      return this.translate.instant('N/A');
    }

    if (isValid(this.value)) {
      return formatDistanceToNowShortened(this.value as number);
    }

    return this.value as string;
  }

  get dateTooltip(): string {
    if (!this.value) {
      return this.translate.instant('N/A');
    }

    if (isValid(this.value)) {
      if (!this.isTimezoneDifference) {
        return this.formatDateTime.transform(this.machineTime);
      }

      const browserTime = this.formatDateTime.transform(this.value as number);
      const machineTime = this.formatDateTime.transform(this.machineTime);

      return this.translate.instant('Machine Time: {machineTime} \n Browser Time: {browserTime}', {
        machineTime,
        browserTime,
      });
    }

    return this.value as string;
  }
}

export function relativeDateColumn<T>(
  options: Partial<IxCellRelativeDateComponent<T>>,
): Column<T, IxCellRelativeDateComponent<T>> {
  return { type: IxCellRelativeDateComponent, ...options };
}
