import { Component, OnInit } from '@angular/core';
import { PhotoResponseModel, TerritorialData } from '@models';
import { LocationService, PhotoService } from '@services';
import { PhotoDisplay } from '../photo-display/photo-display';

@Component({
  selector: 'app-photo-list',
  imports: [
    PhotoDisplay
  ],
  templateUrl: './photo-list.html',
  styleUrl: './photo-list.scss',
})
export class PhotoList implements OnInit {

  public photoData: PhotoResponseModel[] | undefined;
  public territorialData: TerritorialData | undefined;

  constructor(
    private photoService: PhotoService,
    private locationService: LocationService
  ){
    
  }

  public ngOnInit(): void {
    this.photoService.getPhotos().subscribe((resp: PhotoResponseModel[]) => {
      this.photoData = resp;
      console.log(this.photoData)
    });  

    this.locationService.getTerritorialData().subscribe((resp: TerritorialData) => {
      this.territorialData = resp;
    });
  }

  public onPhotoRemoved(photoId: string): void {
    if (!this.photoData) {
      return;
    }
    this.photoData = this.photoData.filter((p) => p.id !== photoId);
  }

  public createLocationBreadcrubs(photoData: PhotoResponseModel): string{
    let breadcrumbs = "";
    
    const countryData = this.territorialData?.data.filter(c => c.id == photoData.countryId)[0];
    breadcrumbs += countryData?.name;

    const voivodeshipData = countryData?.subregions?.filter(v => v.id == photoData.voivodeshipId)[0];
    if(!voivodeshipData) return breadcrumbs;

    breadcrumbs += ` > ${voivodeshipData.name}`;

    const countyData = voivodeshipData?.subregions?.filter(c => c.id == photoData.countyId)[0];
    if(!countyData) return breadcrumbs;

    breadcrumbs += ` > ${countyData.name}`;

    const cityData = countyData.subregions?.filter(c => c.id == photoData.cityId)[0];
    if(!cityData) return breadcrumbs;

    breadcrumbs += ` > ${cityData.name}`;
    return breadcrumbs;
  }
}
