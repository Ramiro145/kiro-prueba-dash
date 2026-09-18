import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Shift } from '../../domains/operations/models/operations.models';
import { ALERTS_RESPONSE } from './alerts.fixtures';
import { createLineDetailFixture } from './line-detail.fixtures';
import { NORTH_PLANT_OVERVIEW, PLANTS } from './operations.fixtures';
import { alertsForShift, lineDetailForShift, overviewForShift } from './shift-fixtures';

export const MOCK_API_LATENCY = new InjectionToken<number>('MOCK_API_LATENCY', {
  factory: () => 250,
});

const SHIFTS: Record<string, Shift> = {
  morning: { id: 'morning', name: 'Turno mañana', startTime: '06:00', endTime: '14:00' },
  afternoon: { id: 'afternoon', name: 'Turno tarde', startTime: '14:00', endTime: '22:00' },
  night: { id: 'night', name: 'Turno noche', startTime: '22:00', endTime: '06:00' },
};

export const mockApiInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (!request.url.startsWith('/api/')) {
    return next(request);
  }

  const latency = inject(MOCK_API_LATENCY);

  if (request.method !== 'GET') {
    return httpError(request, 405, 'Método no permitido');
  }

  if (request.url === '/api/plants') {
    return of(new HttpResponse({ body: PLANTS, status: 200, url: request.urlWithParams })).pipe(
      delay(latency),
    );
  }

  const overviewMatch = request.url.match(/^\/api\/plants\/([^/]+)\/overview$/);
  if (overviewMatch) {
    const plantId = decodeURIComponent(overviewMatch[1]);
    const shiftId = request.params.get('shiftId');
    const shift = shiftId ? SHIFTS[shiftId] : undefined;

    if (plantId === NORTH_PLANT_OVERVIEW.plant.id && shift) {
      return of(
        new HttpResponse({
          body: overviewForShift(NORTH_PLANT_OVERVIEW, shift),
          status: 200,
          url: request.urlWithParams,
        }),
      ).pipe(delay(latency));
    }
  }

  if (request.url === '/api/alerts') {
    const plantId = request.params.get('plantId');
    const shiftId = request.params.get('shiftId');
    if (plantId === NORTH_PLANT_OVERVIEW.plant.id && shiftId && SHIFTS[shiftId]) {
      return of(
        new HttpResponse({
          body: alertsForShift(ALERTS_RESPONSE, SHIFTS[shiftId]),
          status: 200,
          url: request.urlWithParams,
        }),
      ).pipe(delay(latency));
    }
  }

  const lineMatch = request.url.match(/^\/api\/lines\/([^/]+)$/);
  if (lineMatch) {
    const lineId = decodeURIComponent(lineMatch[1]);
    const shiftId = request.params.get('shiftId');
    const shift = shiftId ? SHIFTS[shiftId] : undefined;
    const detail = shift ? createLineDetailFixture(lineId, shift) : null;

    if (detail && shift) {
      return of(
        new HttpResponse({
          body: lineDetailForShift(detail, shift),
          status: 200,
          url: request.urlWithParams,
        }),
      ).pipe(delay(latency));
    }
  }

  return httpError(request, 404, 'Recurso industrial no encontrado');
};

const httpError = (
  request: HttpRequest<unknown>,
  status: number,
  message: string,
): Observable<never> =>
  throwError(
    () =>
      new HttpErrorResponse({
        error: { message },
        status,
        statusText: message,
        url: request.urlWithParams,
      }),
  );
