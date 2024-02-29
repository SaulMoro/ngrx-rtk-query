import { ChangeDetectionStrategy, Component } from '@angular/core';
import { useDecrementCountMutation, useGetCountQuery, useIncrementCountMutation } from '@app/core/services';
import { nanoid } from '@reduxjs/toolkit';

@Component({
  selector: 'app-counter-manager',
  template: `
    <div class="space-y-8">
      <section class="space-y-4">
        <h1 class="text-xl font-semibold">Main Counter</h1>
        <div>
          <div class="flex items-center space-x-4">
            <button class="btn-outline btn-primary" [disabled]="increment.isLoading()" (click)="increment.dispatch(1)">
              +
            </button>
            <span class="text-3xl font-bold">{{ countQuery.data()?.count || 0 }}</span>
            <button class="btn-outline btn-primary" (click)="decrement.dispatch(1)">-</button>
          </div>
          <small>Decrease is a optimistic update!</small>

          <p class="mt-6 bg-gray-200 text-xs">
            <code>{{ countQuery() | json }}</code>
          </p>
        </div>
      </section>

      <section class="space-y-4">
        <hr />
        <div class="flex items-center space-x-8">
          <h1 class="text-xl font-semibold">Counters List</h1>
          <button class="btn btn-primary" (click)="addCounter()">Add individual counter</button>
        </div>
        <div *ngFor="let counter of counters; trackBy: trackByFn" class="mt-6 w-full">
          <app-counter [id]="counter"></app-counter>
        </div>
      </section>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterManagerComponent {
  countQuery = useGetCountQuery();
  increment = useIncrementCountMutation();
  decrement = useDecrementCountMutation();

  counters: string[] = [];

  constructor() {}

  addCounter(): void {
    this.counters = [...this.counters, nanoid()];
  }

  trackByFn(_index: number, id: string): string {
    return id;
  }
}
