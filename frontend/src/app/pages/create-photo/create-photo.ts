import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Header } from '@components';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LocationService, PhotoService } from '@services';
import { PhotoCreateModel, RegionNode, TerritorialData } from '@models';
import { Router } from '@angular/router';
import {
  optionalDayTakenValidator,
  optionalMonthTakenValidator,
  partialDateTakenGroupValidator,
  yearTakenValidator,
} from './create-photo.validators';

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

@Component({
  selector: 'app-create-photo',
  imports: [
    Header,
    ReactiveFormsModule
  ],
  templateUrl: './create-photo.html',
  styleUrl: './create-photo.scss',
})
export class CreatePhoto implements OnInit {
  public photoForm: FormGroup;
  public previewUrl: string | null = null;
  private lastFileExtension: string | null = null;
  private territorialData: TerritorialData | undefined;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private formBuilder: FormBuilder,
    private photoService: PhotoService,
    private router: Router,
    private locationService: LocationService
  ) {
    this.photoForm = this.formBuilder.group(
      {
        title: ['', Validators.required],
        description: ['', Validators.required],
        countryId: [null, Validators.required],
        voivodeshipId: [null],
        countyId: [null],
        cityId: [null],
        yearTaken: [null, yearTakenValidator],
        monthTaken: [null, optionalMonthTakenValidator],
        dayTaken: [null, optionalDayTakenValidator],
        photoData: ['', Validators.required],
      },
      { validators: [partialDateTakenGroupValidator] }
    );

    this.photoForm
      .get('monthTaken')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((month) => {
        if (isEmpty(month)) {
          this.photoForm.patchValue({ dayTaken: null }, { emitEvent: false });
          this.photoForm.get('dayTaken')?.updateValueAndValidity({ emitEvent: false });
          this.photoForm.updateValueAndValidity({ emitEvent: false });
        }
      });
  }

  public ngOnInit(): void {
    this.locationService.getTerritorialData().subscribe((resp: TerritorialData) => {
      this.territorialData = resp;
    });
  }

  public getCountries(): RegionNode[]{
    return this.territorialData?.data ?? [];
  }

  public getVoivodeships(): RegionNode[]{
    const countryId = this.photoForm.value.countryId;
    const countryData = this.territorialData?.data.filter(c => c.id == countryId)[0];
    return countryData?.subregions ?? [];
  }

  public getCounties(): RegionNode[]{
    const voivodeshipId = this.photoForm.value.voivodeshipId;
    const voivodeships = this.getVoivodeships();
    const voivodeshipData = voivodeships?.filter(v => v.id == voivodeshipId)[0];
    return voivodeshipData?.subregions ?? [];
  }

  public getCities(): RegionNode[]{
    const countyId = this.photoForm.value.countyId;
    const counties = this.getCounties();
    const countyData = counties?.filter(c => c.id == countyId)[0];
    return countyData?.subregions ?? [];
  }

  public onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const dot = file.name.lastIndexOf('.');
    this.lastFileExtension =
      dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : null;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1]! : dataUrl;
      this.photoForm.patchValue({ photoData: base64 });
      this.previewUrl = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  public createPhoto(): void {
    this.photoForm.markAllAsTouched();
    if (this.photoForm.valid) {
      this.photoService
        .uploadPhoto(this.preparePhotoModel())
        .pipe()
        .subscribe(() => {
          this.photoForm.reset();
          this.lastFileExtension = null;
          this.previewUrl = null;
          void this.router.navigate(['/feed']);
        });
    }
  }

  // private buildDateTakenIso(): string {
  //   const v = this.photoForm.getRawValue() as {
  //     yearTaken: number | null;
  //     monthTaken: number | null;
  //     dayTaken: number | null;
  //   };
  //   const year = Number(v.yearTaken);
  //   const month = isEmpty(v.monthTaken) ? 1 : Number(v.monthTaken);
  //   const day = isEmpty(v.dayTaken) ? 1 : Number(v.dayTaken);
  //   return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  // }

  private preparePhotoModel(): PhotoCreateModel {
    return {
      title: this.photoForm.value.title,
      description: this.photoForm.value.description,
      countryId: this.photoForm.value.countryId,
      voivodeshipId: this.photoForm.value.voivodeshipId,
      countyId: this.photoForm.value.countyId,
      cityId: this.photoForm.value.cityId,
      yearTaken: this.photoForm.value.yearTaken,
      monthTaken: this.photoForm.value.monthTaken,
      dayTaken: this.photoForm.value.dayTaken,
      photoData: this.photoForm.value.photoData,
      fileExtension: this.lastFileExtension ?? 'jpg',
    };
  }
}
