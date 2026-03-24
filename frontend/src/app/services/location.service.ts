import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { TerritorialData } from '@models';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.api_url}/api/locations`;

  private readonly territorialData$: Observable<TerritorialData> = this.http
    .get<TerritorialData>(`${this.apiUrl}/all`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  public getTerritorialData(): Observable<TerritorialData> {
    return this.territorialData$;
  }
}
