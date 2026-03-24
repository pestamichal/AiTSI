export interface PhotoCreateModel{
    title: string;
    description: string,
    countryId: number,
    voivodeshipId: number,
    countyId: number,
    cityId: number,
    yearTaken: number,
    monthTaken: number,
    dayTaken: number,
    photoData: string,
    fileExtension: string,
}

export interface PhotoResponseModel{
    id: string;
    author: string;
    title: string;
    description: string,
    countryId: number,
    voivodeshipId: number,
    countyId: number,
    cityId: number,
    yearTaken: number,
    monthTaken: number,
    dayTaken: number
}