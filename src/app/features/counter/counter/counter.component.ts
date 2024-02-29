import { ChangeDetectionStrategy, Component, Input, OnInit, computed, signal } from '@angular/core';
import { LazyQueryOptions } from 'ngrx-rtk-query';

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
        <button class="btn-outline btn-primary" [disabled]="increment.isLoading()" (click)="incrementCounter()">
          +
        </button>
        <span class="text-3xl font-bold" [class.bg-green-100]="countQuery.isFetching()">{{
          countQuery.data()?.count || 0
        }}</span>
        <button class="btn-outline btn-primary" [disabled]="decrement.isLoading()" (click)="decrementCounter()">
          -
        </button>

        <select [ngModel]="pollingInterval()" (ngModelChange)="changePollingInterval($event)">
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
  pollingInterval = signal<number>(this.pollingOptions[0].value);
  options = computed(() => ({ pollingInterval: this.pollingInterval() }) as LazyQueryOptions);

  // Queries
  countQuery = useLazyGetCountByIdQuery(this.options);
  increment = useIncrementCountByIdMutation();
  decrement = useDecrementCountByIdMutation();

  constructor() {}

  ngOnInit(): void {
    this.countQuery.fetch(this.id);
  }

  changePollingInterval(interval: number): void {
    this.pollingInterval.set(+interval);
  }

  incrementCounter(): void {
    this.increment.dispatch({ id: this.id, amount: 1 });
  }

  decrementCounter(): void {
    this.decrement.dispatch({ id: this.id, amount: 1 });
  }
}
