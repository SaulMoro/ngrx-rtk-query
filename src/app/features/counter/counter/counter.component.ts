import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { LazyQueryOptions } from 'ngrx-rtk-query';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  useDecrementCountByIdMutation,
  useIncrementCountByIdMutation,
  useLazyGetCountByIdQuery,
} from '@app/core/services';
import { pollingOptions } from '../utils/polling-options';

@Component({
  selector: 'app-counter',
  template: `
    <section class="space-y-4">
      <h1 class="text-md font-medium">{{ id }}</h1>
      <div class="flex items-center space-x-4">
        <button
          *ngIf="increment.state$ | async as incrementState"
          class="btn-outline btn-primary"
          [disabled]="incrementState.isLoading"
          (click)="incrementCounter()"
        >
          +
        </button>
        <span
          *ngIf="countQuery.state$ | async as countQuery"
          class="text-3xl font-bold"
          [class.bg-green-100]="countQuery.isFetching"
          >{{ countQuery.data?.count || 0 }}</span
        >
        <button
          *ngIf="decrement.state$ | async as decrementState"
          class="btn-outline btn-primary"
          [disabled]="decrementState.isLoading"
          (click)="decrementCounter()"
        >
          -
        </button>

        <select [ngModel]="pollingInterval$ | async" (ngModelChange)="changePollingInterval($event)">
          <option *ngFor="let pollingOption of pollingOptions" [value]="pollingOption.value">
            {{ pollingOption.label }}
          </option>
        </select>
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent implements OnInit {
  @Input() id = '';

  // Polling
  pollingOptions = pollingOptions;
  pollingInterval = new BehaviorSubject<number>(this.pollingOptions[0].value);
  pollingInterval$ = this.pollingInterval.asObservable();
  options$ = this.pollingInterval$.pipe(map((pollingInterval) => ({ pollingInterval } as LazyQueryOptions)));

  // Queries
  countQuery = useLazyGetCountByIdQuery(this.options$);
  increment = useIncrementCountByIdMutation();
  decrement = useDecrementCountByIdMutation();

  constructor() {}

  ngOnInit(): void {
    this.countQuery.fetch(this.id);
  }

  changePollingInterval(interval: number): void {
    this.pollingInterval.next(+interval);
  }

  incrementCounter(): void {
    this.increment.dispatch({ id: this.id, amount: 1 });
  }

  decrementCounter(): void {
    this.decrement.dispatch({ id: this.id, amount: 1 });
  }
}
