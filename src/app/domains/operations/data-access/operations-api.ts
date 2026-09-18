import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api-base-url';
import { LineDetailData, Plant, PlantOverview } from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class OperationsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/$/, '');

  getPlants(): Observable<readonly Plant[]> {
    return this.http.get<readonly Plant[]>(`${this.baseUrl}/plants`);
  }

  getOverview(plantId: string, shiftId: string): Observable<PlantOverview> {
    const params = new HttpParams().set('shiftId', shiftId);
    return this.http.get<PlantOverview>(
      `${this.baseUrl}/plants/${encodeURIComponent(plantId)}/overview`,
      { params },
    );
  }

  getLineDetail(lineId: string, shiftId: string): Observable<LineDetailData> {
    const params = new HttpParams().set('shiftId', shiftId);
    return this.http.get<LineDetailData>(`${this.baseUrl}/lines/${encodeURIComponent(lineId)}`, {
      params,
    });
  }
}
