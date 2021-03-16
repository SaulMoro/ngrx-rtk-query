import { Component, ChangeDetectionStrategy } from '@angular/core';
import { nanoid } from '@reduxjs/toolkit';
import { useDecrementCountMutation, useGetCountQuery, useIncrementCountMutation } from '@app/core/services';

@Component({
  selector: 'app-counter-manager',
  template: `
    <div class="space-y-8">
      <section class="space-y-4">
        <h1 class="text-xl font-semibold">Main Counter</h1>
        <div>
          <div class="flex items-center space-x-4">
            <button
              *ngIf="increment.state$ | async as incrementState"
              class="btn-outline btn-primary"
              [disabled]="incrementState.isLoading"
              (click)="increment.dispatch(1)"
            >
              +
            </button>
            <span *ngIf="countQuery$ | async as countQuery" class="text-3xl font-bold">{{
              countQuery.data?.count || 0
            }}</span>
            <button class="btn-outline btn-primary" (click)="decrement.dispatch(1)">-</button>
          </div>
          <small>Decrease is a optimistic update!</small>
          <p class="mt-6 text-xs">{{ countQuery$ | async | json }}</p>
        </div>
      </section>

      <section class="space-y-4">
        <hr />
        <div class="flex items-center space-x-8">
          <h1 class="text-xl font-semibold">Counters List</h1>
          <button class="btn btn-primary" (click)="addCounter()">Add individual counter</button>
        </div>

        <div *ngFor="let counter of counters" class="w-full mt-6">
          <app-counter [id]="counter"></app-counter>
        </div>
      </section>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterManagerComponent {
  countQuery$ = useGetCountQuery();
  increment = useIncrementCountMutation();
  decrement = useDecrementCountMutation();

  counters: string[] = [];

  constructor() {}

  addCounter(): void {
    this.counters = [...this.counters, nanoid()];
  }
}
