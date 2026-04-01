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
import { EditPhotoModel, PhotoResponseModel, RegionNode, TerritorialData } from '@models';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import {
  optionalDayTakenValidator,
  optionalMonthTakenValidator,
  partialDateTakenGroupValidator,
  yearTakenValidator,
} from '../../validators/date.validators';

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

@Component({
  selector: 'app-edit-photo',
  imports: [
    Header,
    ReactiveFormsModule
  ],
  templateUrl: './edit-photo.html',
  styleUrl: './edit-photo.scss',
})
export class EditPhoto implements OnInit {
  public photoForm: FormGroup;
  public photoId: string = "";
  public photoData: PhotoResponseModel | undefined;
  private territorialData: TerritorialData | undefined;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private formBuilder: FormBuilder,
    private photoService: PhotoService,
    private route: ActivatedRoute,
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

    this.photoForm
      .get('countryId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.photoForm.patchValue(
          {
            voivodeshipId: null,
            countyId: null,
            cityId: null,
          },
          { emitEvent: false }
        );
      });

    this.photoForm
      .get('voivodeshipId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.photoForm.patchValue(
          {
            countyId: null,
            cityId: null,
          },
          { emitEvent: false }
        );
      });

    this.photoForm
      .get('countyId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.photoForm.patchValue(
          {
            cityId: null,
          },
          { emitEvent: false }
        );
      });
  }

  public ngOnInit(): void {
    this.photoId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.photoId) {
      return;
    }

    this.locationService
      .getTerritorialData()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((resp: TerritorialData) => {
          this.territorialData = resp;
          return this.photoService.getPhoto(this.photoId);
        })
      )
      .subscribe((photo: PhotoResponseModel) => {
        this.photoData = photo;
        this.photoForm.patchValue({
          title: photo.title,
          description: photo.description,
          countryId: photo.countryId,
          voivodeshipId: photo.voivodeshipId,
          countyId: photo.countyId,
          cityId: photo.cityId,
          yearTaken: photo.yearTaken,
          monthTaken: photo.monthTaken,
          dayTaken: photo.dayTaken,
        });
      });
  }

  public getPhotoUrl(photoId: string): string{
    return this.photoService.getPhotoUrl(photoId)
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

  public editPhoto(): void {
    this.photoForm.markAllAsTouched();
    this.normalizeLocationSelection();
    if (this.photoForm.valid) {
      this.photoService
        .editPhoto(this.preparePhotoModel())
        .pipe()
        .subscribe(() => {
          this.photoForm.reset();
          void this.router.navigate(['/feed']);
        });
    }
  }

  private normalizeLocationSelection(): void {
    const countryId = this.toNumberOrNull(this.photoForm.value.countryId);
    const voivodeshipId = this.toNumberOrNull(this.photoForm.value.voivodeshipId);
    const countyId = this.toNumberOrNull(this.photoForm.value.countyId);
    const cityId = this.toNumberOrNull(this.photoForm.value.cityId);

    const voivodeshipIds = new Set(
      this.getVoivodeshipsByCountryId(countryId).map((v) => v.id)
    );
    const normalizedVoivodeshipId =
      voivodeshipId !== null && voivodeshipIds.has(voivodeshipId) ? voivodeshipId : null;

    const countyIds = new Set(
      this.getCountiesByVoivodeshipId(normalizedVoivodeshipId).map((c) => c.id)
    );
    const normalizedCountyId =
      normalizedVoivodeshipId !== null && countyId !== null && countyIds.has(countyId)
        ? countyId
        : null;

    const cityIds = new Set(this.getCitiesByCountyId(normalizedCountyId).map((c) => c.id));
    const normalizedCityId =
      normalizedCountyId !== null && cityId !== null && cityIds.has(cityId) ? cityId : null;

    this.photoForm.patchValue(
      {
        countryId,
        voivodeshipId: normalizedVoivodeshipId,
        countyId: normalizedCountyId,
        cityId: normalizedCityId,
      },
      { emitEvent: false }
    );
  }

  private toNumberOrNull(value: unknown): number | null {
    if (isEmpty(value)) {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private getVoivodeshipsByCountryId(countryId: number | null): RegionNode[] {
    if (countryId === null) {
      return [];
    }
    const countryData = this.territorialData?.data.find((c) => c.id === countryId);
    return countryData?.subregions ?? [];
  }

  private getCountiesByVoivodeshipId(voivodeshipId: number | null): RegionNode[] {
    if (voivodeshipId === null) {
      return [];
    }
    const voivodeships = this.territorialData?.data.flatMap((c) => c.subregions ?? []) ?? [];
    const voivodeshipData = voivodeships.find((v) => v.id === voivodeshipId);
    return voivodeshipData?.subregions ?? [];
  }

  private getCitiesByCountyId(countyId: number | null): RegionNode[] {
    if (countyId === null) {
      return [];
    }
    const counties =
      this.territorialData?.data
        .flatMap((c) => c.subregions ?? [])
        .flatMap((v) => v.subregions ?? []) ?? [];
    const countyData = counties.find((c) => c.id === countyId);
    return countyData?.subregions ?? [];
  }

  private preparePhotoModel(): EditPhotoModel {
    return {
      id: this.photoId,
      title: this.photoForm.value.title,
      description: this.photoForm.value.description,
      countryId: Number(this.photoForm.value.countryId),
      voivodeshipId: this.toNumberOrNull(this.photoForm.value.voivodeshipId),
      countyId: this.toNumberOrNull(this.photoForm.value.countyId),
      cityId: this.toNumberOrNull(this.photoForm.value.cityId),
      yearTaken: this.photoForm.value.yearTaken,
      monthTaken: this.photoForm.value.monthTaken,
      dayTaken: this.photoForm.value.dayTaken,
    };
  }
}
