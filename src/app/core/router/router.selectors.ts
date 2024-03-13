import { getRouterSelectors } from '@ngrx/router-store';
import { createSelector } from '@ngrx/store';

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
export const selectParamIdNumber = createSelector(selectRouteParam('id'), (id) => {
  const numberId = Number(id);
  return isNaN(numberId) ? undefined : numberId;
});
export const selectCurrentPage = selectQueryParam('page');
