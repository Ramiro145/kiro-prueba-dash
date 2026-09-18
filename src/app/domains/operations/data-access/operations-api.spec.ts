import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { LineDetailData, Plant, PlantOverview } from '../models/operations.models';
import { OperationsApi } from './operations-api';

describe('OperationsApi', () => {
  let api: OperationsApi;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OperationsApi, provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(OperationsApi);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('requests the available plants', async () => {
    const plants: readonly Plant[] = [
      { id: 'plant-north', name: 'Planta Norte', location: 'Monterrey', lineIds: [] },
    ];
    const result = firstValueFrom(api.getPlants());

    httpController.expectOne('/api/plants').flush(plants);

    await expect(result).resolves.toEqual(plants);
  });

  it('requests an overview using plant and shift identifiers', async () => {
    const response = { updatedAt: '2026-09-18T12:00:00.000Z' } as PlantOverview;
    const result = firstValueFrom(api.getOverview('plant-north', 'morning'));
    const request = httpController.expectOne(
      (candidate) =>
        candidate.url === '/api/plants/plant-north/overview' &&
        candidate.params.get('shiftId') === 'morning',
    );

    expect(request.request.method).toBe('GET');
    request.flush(response);

    await expect(result).resolves.toEqual(response);
  });

  it('requests line detail using line and shift identifiers', async () => {
    const response = { updatedAt: '2026-09-18T12:00:00.000Z' } as LineDetailData;
    const result = firstValueFrom(api.getLineDetail('welding-01', 'morning'));
    const request = httpController.expectOne(
      (candidate) =>
        candidate.url === '/api/lines/welding-01' && candidate.params.get('shiftId') === 'morning',
    );

    expect(request.request.method).toBe('GET');
    request.flush(response);
    await expect(result).resolves.toEqual(response);
  });
});
