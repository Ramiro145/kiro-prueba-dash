import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MOCK_API_LATENCY, mockApiInterceptor } from '../../../core/mock-api/mock-api.interceptor';
import { AlertsApi } from './alerts-api';

describe('alerts mock contract', () => {
  it('serves typed alerts and rejects an unknown plant', async () => {
    TestBed.configureTestingModule({
      providers: [
        AlertsApi,
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
        { provide: MOCK_API_LATENCY, useValue: 0 },
      ],
    });
    const api = TestBed.inject(AlertsApi);
    const response = await firstValueFrom(api.getAlerts('plant-north', 'morning'));

    expect(response.alerts.length).toBeGreaterThanOrEqual(6);
    expect(response.alerts.some(({ severity }) => severity === 'critical')).toBe(true);
    await expect(firstValueFrom(api.getAlerts('missing', 'morning'))).rejects.toMatchObject({
      status: 404,
    });
  });
});
