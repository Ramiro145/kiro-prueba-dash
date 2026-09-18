import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { vi } from 'vitest';
import { OperationsActions } from './operations.actions';
import { DEFAULT_DASHBOARD_FILTERS, selectDashboardFilters } from './dashboard-filters.selectors';
import { OverviewLifecycleEffects } from './overview-lifecycle.effects';

describe('OverviewLifecycleEffects', () => {
  let actions: ReplaySubject<Action>;
  let effects: OverviewLifecycleEffects;
  let subscription: Subscription;
  const router = { navigate: vi.fn(() => Promise.resolve(true)) };

  beforeEach(() => {
    router.navigate.mockClear();
    actions = new ReplaySubject<Action>(1);
    TestBed.configureTestingModule({
      providers: [
        OverviewLifecycleEffects,
        provideMockActions((): Observable<Action> => actions),
        provideMockStore({
          selectors: [{ selector: selectDashboardFilters, value: DEFAULT_DASHBOARD_FILTERS }],
        }),
        { provide: Router, useValue: router },
      ],
    });
    effects = TestBed.inject(OverviewLifecycleEffects);
  });

  afterEach(() => subscription?.unsubscribe());

  it('emits one deduplicated data context when overview is entered repeatedly', () => {
    const emitted: Action[] = [];
    subscription = effects.contextChanges$.subscribe((action) => emitted.push(action));

    actions.next(OperationsActions.enterOverview());
    actions.next(OperationsActions.enterOverview());

    expect(emitted).toEqual([
      OperationsActions.setOverviewContext({
        context: { plantId: 'plant-north', shiftId: 'morning' },
      }),
    ]);
  });

  it('writes selected filters to the URL', () => {
    subscription = effects.navigateToFilters$.subscribe();

    actions.next(
      OperationsActions.updateFilters({
        filters: { plantId: 'plant-north', shiftId: 'night', lineId: 'welding-01' },
      }),
    );

    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: { plant: 'plant-north', shift: 'night', line: 'welding-01' },
      queryParamsHandling: '',
    });
  });
});
