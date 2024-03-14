import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { useDecrementCountByIdMutation, useGetCountByIdQuery, useIncrementCountByIdMutation } from '@app/core/services';
import { pollingOptions } from '../utils/polling-options';

@Component({
  selector: 'app-counter',
  template: `
    <section class="space-y-4">
      <h1 class="text-md font-medium">{{ counterId() }}</h1>
      <div class="flex items-center space-x-4">
        <button
          class="btn-outline btn-primary"
          [disabled]="increment.isLoading()"
          (click)="increment({ id: counterId()!, amount: 1 })"
        >
          +
        </button>
        <span class="text-3xl font-bold" [class.bg-green-100]="countQuery.isFetching()">{{
          countQuery.data()?.count || 0
        }}</span>
        <button
          class="btn-outline btn-primary"
          [disabled]="decrement.isLoading()"
          (click)="decrement({ id: counterId()!, amount: 1 })"
        >
          -
        </button>

        <select [ngModel]="pollingInterval()" (ngModelChange)="pollingInterval.set(+$event)">
          <option *ngFor="let pollingOption of pollingOptions" [value]="pollingOption.value">
            {{ pollingOption.label }}
          </option>
        </select>

        <button class="btn-outline btn-primary" (click)="increment.reset()">
          Increment reset {{ increment.originalArgs() | json }}
        </button>
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent {
  readonly counterId = input.required<string>();

  // Polling
  pollingOptions = pollingOptions;
  pollingInterval = signal<number>(this.pollingOptions[0].value);

  // Queries
  countQuery = useGetCountByIdQuery(
    () => this.counterId(),
    () => ({ pollingInterval: this.pollingInterval() }),
  );
  increment = useIncrementCountByIdMutation();
  decrement = useDecrementCountByIdMutation();
}
