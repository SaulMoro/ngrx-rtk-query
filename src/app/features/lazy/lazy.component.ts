import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

import {
  counterApiEndpoints,
  useDecrementCountByIdMutation,
  useIncrementCountByIdMutation,
  useLazyGetCountByIdQuery,
} from '@app/core/services';

const { getCountById } = counterApiEndpoints;

@Component({
  selector: 'app-lazy',
  template: `
    <div *ngIf="countQuery.state$ | async as countQuery" class="space-y-6">
      <form [formGroup]="form" (ngSubmit)="startCounterById(form.value)">
        <h1 class="text-xl font-semibold">Start Lazy Counter</h1>
        <div>
          <input type="text" placeholder="Type counter id" formControlName="id" />
          <button type="submit" class="m-4 btn btn-primary" [disabled]="form.invalid || countQuery.isLoading">
            {{ countQuery.isLoading ? 'Starting...' : 'Start Counter' }}
          </button>
          <label for="preferCacheValue" class="space-x-2 text-sm">
            <input id="preferCacheValue" type="checkbox" formControlName="preferCacheValue" />
            <span>Prefer Cache (No fetch if counter exists with same id in cache)</span>
          </label>
        </div>
      </form>

      <section class="space-y-4">
        <h1 class="font-medium text-md">Current id: {{ countQuery.originalArgs || 'Not Started' }}</h1>
        <div class="flex items-center space-x-4">
          <button
            *ngIf="increment.state$ | async as incrementState"
            class="btn-outline btn-primary"
            [disabled]="incrementState.isLoading || countQuery.isUninitialized"
            (click)="incrementCounter(countQuery.originalArgs)"
          >
            +
          </button>
          <span class="text-3xl font-bold" [class.bg-green-100]="countQuery.isFetching">{{
            countQuery.data?.count || 0
          }}</span>
          <button
            *ngIf="decrement.state$ | async as decrementState"
            class="btn-outline btn-primary"
            [disabled]="decrementState.isLoading || countQuery.isUninitialized"
            (click)="decrementCounter(countQuery.originalArgs)"
          >
            -
          </button>
        </div>
      </section>
    </div>

    <div class="mt-8 space-y-6">
      <section *ngIf="countQuery.state$ | async as countQuery" class="space-y-4">
        <h1 class="font-medium text-md">Duplicate Subscription (Share subscription)</h1>
        <div class="flex items-center space-x-4">
          <button
            *ngIf="increment.state$ | async as incrementState"
            class="btn-outline btn-primary"
            [disabled]="incrementState.isLoading || countQuery.isUninitialized"
            (click)="incrementCounter(countQuery.originalArgs)"
          >
            +
          </button>
          <span class="text-3xl font-bold" [class.bg-green-100]="countQuery.isFetching">{{
            countQuery.data?.count || 0
          }}</span>
          <button
            *ngIf="decrement.state$ | async as decrementState"
            class="btn-outline btn-primary"
            [disabled]="decrementState.isLoading || countQuery.isUninitialized"
            (click)="decrementCounter(countQuery.originalArgs)"
          >
            -
          </button>
        </div>
      </section>

      <section *ngIf="selectFromState$ | async as countQuery" class="space-y-4">
        <h1 class="font-medium text-md">Select from state (Share data)</h1>
        <div class="flex items-center space-x-4">
          <button
            *ngIf="increment.state$ | async as incrementState"
            class="btn-outline btn-primary"
            [disabled]="incrementState.isLoading || countQuery.isUninitialized"
            (click)="incrementCounter(countQuery.originalArgs)"
          >
            +
          </button>
          <span class="text-3xl font-bold" [class.bg-green-100]="countQuery.isFetching">{{
            countQuery.data?.count || 0
          }}</span>
          <button
            *ngIf="decrement.state$ | async as decrementState"
            class="btn-outline btn-primary"
            [disabled]="decrementState.isLoading || countQuery.isUninitialized"
            (click)="decrementCounter(countQuery.originalArgs)"
          >
            -
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyComponent {
  countQuery = useLazyGetCountByIdQuery();
  increment = useIncrementCountByIdMutation();
  decrement = useDecrementCountByIdMutation();

  selectFromState$ = getCountById.useQueryState(this.countQuery.info$.pipe(map(({ lastArg }) => lastArg)));

  form = this.formBuilder.group({
    id: ['', [Validators.required, Validators.minLength(2)]],
    preferCacheValue: [false],
  });

  constructor(private formBuilder: FormBuilder) {}

  startCounterById({ id, preferCacheValue }: { id: string; preferCacheValue: boolean }): void {
    this.countQuery.fetch(id, { preferCacheValue });
  }

  incrementCounter(id: string = ''): void {
    this.increment.dispatch({ id, amount: 1 });
  }

  decrementCounter(id: string = ''): void {
    this.decrement.dispatch({ id, amount: 1 });
  }
}
