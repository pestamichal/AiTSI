import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import {
  AppliedPhotoSearch,
  PhotoResponseModel,
  RegionNode,
  defaultAppliedPhotoSearch,
  territoryIdsFromBreadcrumb,
} from '@models';
import { PhotoService } from './photo.service';

export type PhotoFeedQueryParams = Record<string, string>;

@Injectable({
  providedIn: 'root',
})
export class PhotoFeedService {
  private readonly appliedSearch: AppliedPhotoSearch = defaultAppliedPhotoSearch();
  private territoryBreadcrumb: RegionNode[] = [];

  private authorEmail: string | null = null;

  private readonly photosSubject = new BehaviorSubject<PhotoResponseModel[]>([]);
  public readonly photos$: Observable<PhotoResponseModel[]> =
    this.photosSubject.asObservable();

  constructor(private photoService: PhotoService) {}

  public setAppliedSearch(criteria: AppliedPhotoSearch): void {
    Object.assign(this.appliedSearch, criteria);
  }

  public setTerritoryBreadcrumb(breadcrumb: RegionNode[]): void {
    this.territoryBreadcrumb = [...breadcrumb];
  }

  public setAuthorEmailFilter(email: string | null): void {
    this.authorEmail = email?.trim() ? email.trim() : null;
  }

  public refreshPhotos(): void {
    const params = this.buildQueryParams();
    this.photoService
      .getPhotos(params)
      .pipe(catchError(() => of([] as PhotoResponseModel[])))
      .subscribe((photos) => this.photosSubject.next(photos));
  }

  private buildQueryParams(): PhotoFeedQueryParams {
    const params: PhotoFeedQueryParams = {};
    const s = this.appliedSearch;

    const kw = s.keywords.trim();
    if (kw.length > 0) {
      params['keywords'] = kw;
    }
    if (s.yearFrom != null) {
      params['yearFrom'] = String(s.yearFrom);
    }
    if (s.monthFrom != null) {
      params['monthFrom'] = String(s.monthFrom);
    }
    if (s.dayFrom != null) {
      params['dayFrom'] = String(s.dayFrom);
    }
    if (s.yearTo != null) {
      params['yearTo'] = String(s.yearTo);
    }
    if (s.monthTo != null) {
      params['monthTo'] = String(s.monthTo);
    }
    if (s.dayTo != null) {
      params['dayTo'] = String(s.dayTo);
    }
    params['sort'] = s.sortOrder;

    const t = territoryIdsFromBreadcrumb(this.territoryBreadcrumb);
    if (t.countryId != null) {
      params['countryId'] = String(t.countryId);
    }
    if (t.voivodeshipId != null) {
      params['voivodeshipId'] = String(t.voivodeshipId);
    }
    if (t.countyId != null) {
      params['countyId'] = String(t.countyId);
    }
    if (t.cityId != null) {
      params['cityId'] = String(t.cityId);
    }

    if (this.authorEmail != null && this.authorEmail.length > 0) {
      params['author'] = this.authorEmail;
    }

    return params;
  }
}
