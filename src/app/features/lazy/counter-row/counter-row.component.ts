import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { useDecrementCountByIdMutation, useIncrementCountByIdMutation } from '@app/core/services';

@Component({
  selector: 'app-counter-row',
  template: `
    <div class="mt-4 flex items-center space-x-4">
      <button
        *ngIf="increment.state$ | async as incrementState"
        class="btn-outline btn-primary"
        [disabled]="incrementState.isLoading || counterData?.isUninitialized"
        (click)="incrementCounter()"
      >
        +
      </button>
      <span class="text-3xl font-bold" [class.bg-green-100]="counterData?.isFetching">{{
        counterData?.data?.count || 0
      }}</span>
      <button
        *ngIf="decrement.state$ | async as decrementState"
        class="btn-outline btn-primary"
        [disabled]="decrementState.isLoading || counterData?.isUninitialized"
        (click)="decrementCounter()"
      >
        -
      </button>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterRowComponent {
  @Input() counterData?: {
    originalArgs?: string;
    isFetching: boolean;
    isUninitialized: boolean;
    data?: { count: number };
  };

  increment = useIncrementCountByIdMutation();
  decrement = useDecrementCountByIdMutation();

  constructor() {}

  incrementCounter(): void {
    this.increment.dispatch({ id: this.counterData?.originalArgs ?? '', amount: 1 });
  }

  decrementCounter(): void {
    this.decrement.dispatch({ id: this.counterData?.originalArgs ?? '', amount: 1 });
  }
}
