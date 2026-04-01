export interface PhotoCreateModel{
    title: string;
    description: string,
    countryId: number,
    voivodeshipId: number | null,
    countyId: number | null,
    cityId: number | null,
    yearTaken: number,
    monthTaken: number | null,
    dayTaken: number | null,
    photoData: string,
    fileExtension: string,
}

export interface EditPhotoModel{
    id: string,
    title: string;
    description: string,
    countryId: number,
    voivodeshipId: number | null,
    countyId: number | null,
    cityId: number | null,
    yearTaken: number,
    monthTaken: number | null,
    dayTaken: number | null,
}

export interface PhotoResponseModel{
    id: string;
    author: string;
    title: string;
    description: string,
    countryId: number,
    voivodeshipId: number | null,
    countyId: number | null,
    cityId: number | null,
    yearTaken: number,
    monthTaken: number | null,
    dayTaken: number | null
}