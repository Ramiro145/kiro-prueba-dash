import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AlertsResponse } from '../models/alert.models';
import { AlertsApi } from './alerts-api';

describe('AlertsApi', () => {
  it('requests alerts using plant and shift query parameters', async () => {
    TestBed.configureTestingModule({
      providers: [AlertsApi, provideHttpClient(), provideHttpClientTesting()],
    });
    const api = TestBed.inject(AlertsApi);
    const http = TestBed.inject(HttpTestingController);
    const response = { alerts: [], generatedAt: '2026-09-18T12:00:00.000Z' } as AlertsResponse;
    const result = firstValueFrom(api.getAlerts('plant-north', 'morning'));
    const request = http.expectOne(
      (candidate) =>
        candidate.url === '/api/alerts' &&
        candidate.params.get('plantId') === 'plant-north' &&
        candidate.params.get('shiftId') === 'morning',
    );

    expect(request.request.method).toBe('GET');
    request.flush(response);
    await expect(result).resolves.toEqual(response);
    http.verify();
  });
});
