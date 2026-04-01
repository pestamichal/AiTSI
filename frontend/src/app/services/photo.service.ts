import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { EditPhotoModel, PhotoCreateModel, PhotoResponseModel } from '@models';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {

  protected apiUrl: string = `${environment.api_url}/api/photos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ){
  }
  
  public uploadPhoto(photo: PhotoCreateModel): Observable<PhotoResponseModel>{
    return this.http.post<PhotoResponseModel>(`${this.apiUrl}/create`, photo, {headers: this.authService.getRequestHeaders()})
  }

  public editPhoto(photo: EditPhotoModel): Observable<boolean>{
    return this.http.post<boolean>(`${this.apiUrl}/edit`, photo, {headers: this.authService.getRequestHeaders()});
  }

  public deletePhoto(photoId: string): Observable<boolean>{
    return this.http.delete<boolean>(`${this.apiUrl}/delete/${photoId}`, {headers: this.authService.getRequestHeaders()});
  }

  public getPhoto(photoId: string): Observable<PhotoResponseModel>{
    return this.http.get<PhotoResponseModel>(`${this.apiUrl}/${photoId}`);
  }

  public getPhotoUrl(photoId: string): string{
    return `${this.apiUrl}/file/${photoId}`;
  }

  public getPhotos(): Observable<PhotoResponseModel[]>{
    return this.http.get<PhotoResponseModel[]>(`${this.apiUrl}/get`);
  }
}
