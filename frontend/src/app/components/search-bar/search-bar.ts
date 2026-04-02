import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AppliedPhotoSearch } from '@models';
import { PhotoFeedService } from '@services';
import {
  optionalDayTakenValidator,
  optionalMonthTakenValidator,
  optionalYearSearchValidator,
  searchDateRangeOrderValidator,
  searchPartialDateFromValidator,
  searchPartialDateToValidator,
} from '../../validators/date.validators';

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  private readonly fb = inject(FormBuilder);
  private readonly photoFeed = inject(PhotoFeedService);
  private readonly destroyRef = inject(DestroyRef);

  public searchSubmitted = false;

  public readonly searchForm = this.fb.group(
    {
      keywords: [''],
      yearFrom: [null as number | null, optionalYearSearchValidator],
      monthFrom: [null as number | null, optionalMonthTakenValidator],
      dayFrom: [null as number | null, optionalDayTakenValidator],
      yearTo: [null as number | null, optionalYearSearchValidator],
      monthTo: [null as number | null, optionalMonthTakenValidator],
      dayTo: [null as number | null, optionalDayTakenValidator],
      sortOrder: ['newest' as 'newest' | 'oldest'],
    },
    {
      validators: [
        searchPartialDateFromValidator,
        searchPartialDateToValidator,
        searchDateRangeOrderValidator,
      ],
    }
  );

  constructor() {
    const yf = this.searchForm.get('yearFrom');
    const mf = this.searchForm.get('monthFrom');
    yf?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((year) => {
      if (isEmpty(year)) {
        this.searchForm.patchValue({ monthFrom: null, dayFrom: null }, { emitEvent: false });
        this.searchForm.get('monthFrom')?.updateValueAndValidity({ emitEvent: false });
        this.searchForm.get('dayFrom')?.updateValueAndValidity({ emitEvent: false });
        this.searchForm.updateValueAndValidity({ emitEvent: false });
      }
    });
    mf?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((month) => {
      if (isEmpty(month)) {
        this.searchForm.patchValue({ dayFrom: null }, { emitEvent: false });
        this.searchForm.get('dayFrom')?.updateValueAndValidity({ emitEvent: false });
        this.searchForm.updateValueAndValidity({ emitEvent: false });
      }
    });

    const yt = this.searchForm.get('yearTo');
    const mt = this.searchForm.get('monthTo');
    yt?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((year) => {
      if (isEmpty(year)) {
        this.searchForm.patchValue({ monthTo: null, dayTo: null }, { emitEvent: false });
        this.searchForm.get('monthTo')?.updateValueAndValidity({ emitEvent: false });
        this.searchForm.get('dayTo')?.updateValueAndValidity({ emitEvent: false });
        this.searchForm.updateValueAndValidity({ emitEvent: false });
      }
    });
    mt?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((month) => {
      if (isEmpty(month)) {
        this.searchForm.patchValue({ dayTo: null }, { emitEvent: false });
        this.searchForm.get('dayTo')?.updateValueAndValidity({ emitEvent: false });
        this.searchForm.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  public searchPhotos(): void {
    this.searchSubmitted = true;
    this.searchForm.updateValueAndValidity();
    if (!this.searchForm.valid) {
      return;
    }

    const v = this.searchForm.getRawValue();
    const criteria: AppliedPhotoSearch = {
      keywords: (v.keywords ?? '').trim(),
      yearFrom: this.toNullableNumber(v.yearFrom),
      monthFrom: this.toNullableNumber(v.monthFrom),
      dayFrom: this.toNullableNumber(v.dayFrom),
      yearTo: this.toNullableNumber(v.yearTo),
      monthTo: this.toNullableNumber(v.monthTo),
      dayTo: this.toNullableNumber(v.dayTo),
      sortOrder: v.sortOrder === 'oldest' ? 'oldest' : 'newest',
    };
    this.photoFeed.setAppliedSearch(criteria);
    this.photoFeed.refreshPhotos();
  }

  private toNullableNumber(value: unknown): number | null {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
}
