import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { OperationsApi } from '../../domains/operations/data-access/operations-api';
import { MOCK_API_LATENCY, mockApiInterceptor } from './mock-api.interceptor';

describe('mockApiInterceptor', () => {
  let api: OperationsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OperationsApi,
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
        { provide: MOCK_API_LATENCY, useValue: 0 },
      ],
    });
    api = TestBed.inject(OperationsApi);
  });

  it('serves a typed plant overview through the HTTP contract', async () => {
    const overview = await firstValueFrom(api.getOverview('plant-north', 'morning'));

    expect(overview.plant.name).toBe('Planta Norte');
    expect(overview.shift.id).toBe('morning');
    expect(overview.lines.map((line) => line.stage)).toEqual([
      'cutting',
      'forming',
      'welding',
      'finishing',
    ]);
  });

  it('returns an HTTP 404 for an unknown plant', async () => {
    await expect(firstValueFrom(api.getOverview('missing', 'morning'))).rejects.toMatchObject({
      status: 404,
    });
  });
});
