import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PlantOverview } from '../models/operations.models';
import { DashboardFilters } from './dashboard-filters.selectors';

export interface OverviewContext {
  readonly plantId: string;
  readonly shiftId: string;
}

export const OperationsActions = createActionGroup({
  source: 'Operations',
  events: {
    'Enter Overview': emptyProps(),
    'Leave Overview': emptyProps(),
    'Update Filters': props<{ filters: DashboardFilters }>(),
    'Set Overview Context': props<{ context: OverviewContext }>(),
    'Refresh Overview': emptyProps(),
    'Load Overview': props<{ context: OverviewContext }>(),
    'Load Overview Success': props<{ context: OverviewContext; overview: PlantOverview }>(),
    'Load Overview Failure': props<{ context: OverviewContext; error: string }>(),
  },
});
