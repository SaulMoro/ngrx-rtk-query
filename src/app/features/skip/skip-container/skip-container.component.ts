import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { nanoid } from '@reduxjs/toolkit';

@Component({
  selector: 'app-skip-container',
  template: `
    <section class="space-y-2">
      <button class="btn-outline btn-primary" (click)="setRunning()">
        {{ running() ? 'Unmount' : 'Mount' }}
      </button>
      <ng-container>
        <app-pokemon *ngIf="running()" [name]="name()" />
      </ng-container>

      <div class="space-y-4">
        <h3>Subscriptions ({{ getSubscriptionsLength(subscriptions()) }}):</h3>
        <pre>{{ subscriptions() | json }}</pre>
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkipContainerComponent implements OnDestroy {
  private readonly store = inject(Store);
  subscriptions = this.store.selectSignal((state) => state.pokemonApi?.subscriptions);

  name = signal(nanoid());
  running = signal(false);

  queryIntervalId: any;

  getSubscriptionsLength(subscriptions: object): number {
    return Object.keys(subscriptions).length;
  }

  setRunning(): void {
    this.running.update((running) => !running);
    if (!this.running) {
      clearInterval(this.queryIntervalId);
    } else {
      this.queryIntervalId = setInterval(() => this.name.set(nanoid()));
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.queryIntervalId);
  }
}
