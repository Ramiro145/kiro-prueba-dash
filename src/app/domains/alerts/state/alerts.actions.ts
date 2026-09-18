import { createActionGroup, props } from '@ngrx/store';
import { AlertFilters, AlertsResponse } from '../models/alert.models';

export const AlertsActions = createActionGroup({
  source: 'Alerts',
  events: {
    Load: props<{ plantId: string; shiftId: string }>(),
    'Load Success': props<{ response: AlertsResponse }>(),
    'Load Failure': props<{ error: string }>(),
    'Set Filters': props<{ filters: AlertFilters }>(),
  },
});
