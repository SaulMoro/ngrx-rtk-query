import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

import { Character } from '../models';
import { useGetCharactersQuery } from '../services';

@Component({
  template: `
    <section *ngIf="charactersQuery$ | async as charactersQuery" class="space-y-4">
      <div class="flex items-center justify-between">
        <button
          class="btn-outline btn-primary w-32"
          [disabled]="charactersQuery.isFetching"
          (click)="charactersQuery.refetch()"
        >
          {{ charactersQuery.isFetching ? 'Fetching...' : 'Refresh' }}
        </button>
        <div>
          <app-paginator
            [currentPage]="charactersQuery.originalArgs || 1"
            [pages]="charactersQuery.data?.info?.pages"
          ></app-paginator>
        </div>
        <button
          class="btn-outline btn-primary"
          queryParamsHandling="merge"
          [disabled]="charactersQuery.isLoading"
          [routerLink]="['./']"
          [queryParams]="{ page: 999 }"
        >
          Nav to bad page
        </button>
      </div>

      <pre *ngIf="charactersQuery.isError">{{ charactersQuery.error | json }}</pre>

      <div *ngIf="charactersQuery.data?.results as characters" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <app-character-card
          *ngFor="let character of characters; trackBy: trackByFn"
          [character]="character"
        ></app-character-card>
      </div>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharactersListComponent {
  charactersQuery$ = useGetCharactersQuery(this.route.queryParams.pipe(map((q): number => +q?.page || 1)));

  constructor(private route: ActivatedRoute) {}

  trackByFn(_index: number, character: Character): number {
    return character.id;
  }
}
