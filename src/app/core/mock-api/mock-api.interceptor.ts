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
import { NORTH_PLANT_OVERVIEW, PLANTS } from './operations.fixtures';

export const MOCK_API_LATENCY = new InjectionToken<number>('MOCK_API_LATENCY', {
  factory: () => 250,
});

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

    if (plantId === NORTH_PLANT_OVERVIEW.plant.id && shiftId === NORTH_PLANT_OVERVIEW.shift.id) {
      return of(
        new HttpResponse({
          body: NORTH_PLANT_OVERVIEW,
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
