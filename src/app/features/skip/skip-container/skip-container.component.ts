import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { nanoid } from '@reduxjs/toolkit';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-skip-container',
  template: `
    <section class="space-y-2">
      <button class="btn-outline btn-primary" (click)="setRunning()">
        {{ running ? 'Unmount' : 'Mount' }}
      </button>
      <ng-container *ngIf="name$ | async as name">
        <app-pokemon *ngIf="running" [name]="name" />
      </ng-container>

      <div *ngIf="subscriptions$ | async as subscriptions" class="space-y-4">
        <h3>Subscriptions ({{ getSubscriptionsLength(subscriptions) }}):</h3>
        <pre>{{ subscriptions | json }}</pre>
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkipContainerComponent implements OnDestroy {
  private readonly store = inject(Store);
  subscriptions$ = this.store.select((state) => state.pokemonApi?.subscriptions);

  nameBehavior: BehaviorSubject<string> = new BehaviorSubject<string>(nanoid());
  name$ = this.nameBehavior.asObservable();
  running = false;

  queryIntervalId: any;

  getSubscriptionsLength(subscriptions: object): number {
    return Object.keys(subscriptions).length;
  }

  setRunning(): void {
    this.running = !this.running;
    if (!this.running) {
      clearInterval(this.queryIntervalId);
    } else {
      this.queryIntervalId = setInterval(() => this.nameBehavior.next(nanoid()));
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.queryIntervalId);
  }
}
