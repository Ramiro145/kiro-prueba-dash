import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api-base-url';
import { AlertsResponse } from '../models/alert.models';

@Injectable({ providedIn: 'root' })
export class AlertsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/$/, '');

  getAlerts(plantId: string, shiftId: string): Observable<AlertsResponse> {
    const params = new HttpParams().set('plantId', plantId).set('shiftId', shiftId);
    return this.http.get<AlertsResponse>(`${this.baseUrl}/alerts`, { params });
  }
}
