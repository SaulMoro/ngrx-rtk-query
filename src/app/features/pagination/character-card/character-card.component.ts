import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { useGetEpisodeQuery } from '../services';
import { Character, CharacterStatus, Episode } from '../models';

@Component({
  selector: 'app-character-card',
  template: `
    <div
      class="flex flex-col items-center justify-center h-full p-4 transition-colors duration-200 bg-white rounded-lg shadow hover:bg-gray-100"
    >
      <div
        class="inline-flex w-40 h-40 overflow-hidden border border-gray-200 rounded-full shadow-lg dark:border-gray-800"
      >
        <img [src]="character.image" [alt]="character.name" class="w-full h-full" />
      </div>

      <h2 class="mt-4 text-xl font-bold">{{ character.name }}</h2>
      <h6 class="mt-1 text-sm font-medium">{{ character.species }} - {{ character.gender }}</h6>
      <div class="flex items-center mt-1 space-x-2">
        <span
          class="w-3 h-3 rounded-full shadow"
          [ngClass]="
            character.status.toLowerCase() === statusTypes.dead
              ? 'bg-red-400'
              : character.status.toLowerCase() === statusTypes.alive
              ? 'bg-green-400'
              : 'bg-gray-400'
          "
        ></span>
        <h6 class="text-sm font-medium">{{ character.status }}</h6>
      </div>

      <p class="self-start mt-3 text-xs text-gray-500 dark:text-gray-400">
        Last known location:
        <span class="inline-block text-indigo-700 hover:text-indigo-800">{{ character.location?.name }}</span>
      </p>
      <div
        *ngIf="episodeQuery$ | async as episodeQuery"
        class="self-start mt-3 text-xs text-gray-500 dark:text-gray-400"
      >
        First seen:
        <div
          *ngIf="episodeQuery.isLoading; else episodeName"
          class="inline-block w-32 h-4 ml-1 bg-indigo-200 rounded animate-pulse"
        ></div>
        <ng-template #episodeName>
          <span class="inline-block text-indigo-700 hover:text-indigo-800">
            {{ episodeQuery.data?.name }}
          </span>
        </ng-template>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCardComponent implements OnInit {
  @Input() character!: Character;

  episodeQuery$!: Observable<{ data?: Episode; isLoading: boolean }>;
  statusTypes = CharacterStatus;

  constructor() {}

  ngOnInit(): void {
    this.episodeQuery$ = useGetEpisodeQuery(+this.character.episode[0].split('episode/')[1]);
  }
}
