import { getRouterSelectors } from '@ngrx/router-store';

export const {
  selectCurrentRoute,
  selectFragment,
  selectQueryParams,
  selectQueryParam,
  selectRouteParams,
  selectRouteParam,
  selectRouteData,
  selectRouteDataParam,
  selectUrl,
} = getRouterSelectors();

export const selectParamId = selectRouteParam('id');
export const selectCurrentPage = selectQueryParam('page');
