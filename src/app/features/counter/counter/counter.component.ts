import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { QueryOptions, QueryResult } from 'ngrx-rtk-query';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { useDecrementCountByIdMutation, useGetCountByIdQuery, useIncrementCountByIdMutation } from '@app/core/services';
import { pollingOptions } from '../utils/polling-options';

@Component({
  selector: 'app-counter',
  template: `
    <section class="space-y-4">
      <h1 class="font-medium text-md">{{ id }}</h1>
      <div *ngIf="countQuery$ | async as countQuery">
        <div class="flex items-center space-x-4">
          <button
            *ngIf="increment.state$ | async as incrementState"
            class="btn-outline btn-primary"
            [disabled]="incrementState.isLoading"
            (click)="incrementCounter()"
          >
            +
          </button>
          <span class="text-3xl font-bold" [class.bg-green-100]="countQuery.isFetching">{{
            countQuery.data?.count || 0
          }}</span>
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
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent implements OnInit {
  @Input() id = '';

  // Queries
  countQuery$!: Observable<QueryResult>;
  increment = useIncrementCountByIdMutation();
  decrement = useDecrementCountByIdMutation();

  // Polling
  pollingOptions = pollingOptions;
  pollingInterval = new BehaviorSubject<number>(this.pollingOptions[0].value);
  pollingInterval$ = this.pollingInterval.asObservable();

  constructor() {}

  ngOnInit(): void {
    this.countQuery$ = useGetCountByIdQuery(
      this.id,
      this.pollingInterval$.pipe(map((pollingInterval): QueryOptions => ({ pollingInterval }))),
    );
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
