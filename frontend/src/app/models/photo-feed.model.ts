import { RegionNode } from './location.model';

export interface AppliedPhotoSearch {
  keywords: string;
  yearFrom: number | null;
  monthFrom: number | null;
  dayFrom: number | null;
  yearTo: number | null;
  monthTo: number | null;
  dayTo: number | null;
  sortOrder: 'newest' | 'oldest';
}

export const defaultAppliedPhotoSearch = (): AppliedPhotoSearch => ({
  keywords: '',
  yearFrom: null,
  monthFrom: null,
  dayFrom: null,
  yearTo: null,
  monthTo: null,
  dayTo: null,
  sortOrder: 'newest',
});

export function territoryIdsFromBreadcrumb(
  breadcrumb: RegionNode[]
): {
  countryId?: number;
  voivodeshipId?: number;
  countyId?: number;
  cityId?: number;
} {
  if (breadcrumb.length < 1) {
    return {};
  }
  const out: {
    countryId?: number;
    voivodeshipId?: number;
    countyId?: number;
    cityId?: number;
  } = { countryId: breadcrumb[0].id };
  if (breadcrumb.length >= 2) {
    out.voivodeshipId = breadcrumb[1].id;
  }
  if (breadcrumb.length >= 3) {
    out.countyId = breadcrumb[2].id;
  }
  if (breadcrumb.length >= 4) {
    out.cityId = breadcrumb[3].id;
  }
  return out;
}
