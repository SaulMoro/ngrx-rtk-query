import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { useDecrementCountByIdMutation, useIncrementCountByIdMutation } from '@app/core/services';

@Component({
  selector: 'app-counter-row',
  template: `
    <div class="mt-4 flex items-center space-x-4">
      <button
        class="btn-outline btn-primary"
        [disabled]="increment.isLoading() || isUninitialized"
        (click)="increment({ id: originalArgs ?? '', amount: 1 })"
      >
        +
      </button>
      <span class="text-3xl font-bold" [class.bg-green-100]="isFetching">{{ data?.count || 0 }}</span>
      <button
        class="btn-outline btn-primary"
        [disabled]="decrement.isLoading() || isUninitialized"
        (click)="decrement({ id: originalArgs ?? '', amount: 1 })"
      >
        -
      </button>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterRowComponent {
  @Input() originalArgs?: string;
  @Input() data?: { count: number };
  @Input() isFetching: boolean = false;
  @Input() isUninitialized: boolean = true;

  increment = useIncrementCountByIdMutation();
  decrement = useDecrementCountByIdMutation();
}
