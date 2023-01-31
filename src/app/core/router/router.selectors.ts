import { createFeatureSelector } from '@ngrx/store';
import { getRouterSelectors, RouterReducerState } from '@ngrx/router-store';

export const selectRouterState = createFeatureSelector<RouterReducerState>('router');

export const {
  selectCurrentRoute,
  selectFragment,
  selectQueryParams,
  selectQueryParam,
  selectRouteParams,
  selectRouteParam,
  selectRouteData,
  selectUrl,
} = getRouterSelectors(selectRouterState);

export const selectParamId = selectRouteParam('id');
export const selectCurrentPage = selectQueryParam('page');
