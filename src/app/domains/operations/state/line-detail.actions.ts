import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LineDetailData } from '../models/operations.models';

export type LineDetailErrorKind = 'notFound' | 'transport';

export const LineDetailActions = createActionGroup({
  source: 'Line Detail',
  events: {
    Load: props<{ lineId: string; shiftId: string }>(),
    'Load Success': props<{ detail: LineDetailData }>(),
    'Load Failure': props<{ kind: LineDetailErrorKind; error: string }>(),
    Clear: emptyProps(),
  },
});
