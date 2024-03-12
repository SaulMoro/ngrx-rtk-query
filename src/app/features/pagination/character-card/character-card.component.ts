import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Character, CharacterStatus } from '../models';
import { useLazyGetEpisodeQuery } from '../services';

@Component({
  selector: 'app-character-card',
  template: `
    <div
      class="flex h-full flex-col items-center justify-center rounded-lg bg-white p-4 shadow transition-colors duration-200 hover:bg-gray-100"
    >
      <div
        class="inline-flex h-40 w-40 overflow-hidden rounded-full border border-gray-200 shadow-lg dark:border-gray-800"
      >
        <img class="h-full w-full" [src]="character.image" [alt]="character.name" />
      </div>

      <h2 class="mt-4 text-xl font-bold">{{ character.name }}</h2>
      <h6 class="mt-1 text-sm font-medium">{{ character.species }} - {{ character.gender }}</h6>
      <div class="mt-1 flex items-center space-x-2">
        <span
          class="h-3 w-3 rounded-full shadow"
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

      <p class="mt-3 self-start text-xs text-gray-500 dark:text-gray-400">
        Last known location:
        <span class="inline-block text-indigo-700 hover:text-indigo-800">{{ character.location.name }}</span>
      </p>
      <div class="mt-3 self-start text-xs text-gray-500 dark:text-gray-400">
        First seen:
        <div
          *ngIf="episodeLazyQuery.isLoading(); else episodeName"
          class="ml-1 inline-block h-4 w-32 animate-pulse rounded bg-indigo-200"
        ></div>
        <ng-template #episodeName>
          <span class="inline-block text-indigo-700 hover:text-indigo-800">
            {{ episodeLazyQuery.data()?.name }}
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

  episodeLazyQuery = useLazyGetEpisodeQuery();
  statusTypes = CharacterStatus;

  ngOnInit(): void {
    this.episodeLazyQuery(+this.character.episode[0].split('episode/')[1], { preferCacheValue: true });
  }
}
