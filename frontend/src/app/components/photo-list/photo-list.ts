import { Component, OnInit } from '@angular/core';
import { PhotoResponseModel } from '@models';
import { PhotoService } from '@services';
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

  constructor(
    private photoService: PhotoService
  ){
    
  }

  public ngOnInit(): void {
    this.photoService.getPhotos().subscribe((resp: PhotoResponseModel[]) => {
      this.photoData = resp;
      console.log(this.photoData)
    });  
  }

  public onPhotoRemoved(photoId: string): void {
    if (!this.photoData) {
      return;
    }
    this.photoData = this.photoData.filter((p) => p.id !== photoId);
  }
}
