import { createActionGroup, props } from '@ngrx/store';
import { PlantOverview } from '../models/operations.models';

export const OperationsActions = createActionGroup({
  source: 'Operations',
  events: {
    'Load Overview': props<{ plantId: string; shiftId: string }>(),
    'Load Overview Success': props<{ overview: PlantOverview }>(),
    'Load Overview Failure': props<{ error: string }>(),
  },
});
