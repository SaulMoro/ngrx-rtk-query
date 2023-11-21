import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { QueryOptions } from 'ngrx-rtk-query';
import { pokemonApi } from '../services';

@Component({
  selector: 'app-pokemon',
  template: `<ng-container *ngIf="query()"></ng-container>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonComponent implements OnInit, OnDestroy {
  @Input() set name(value: string) {
    this.#name.set(value);
  }
  #name = signal(this.name);

  #skip = signal(false);
  #options = computed(() => ({ skip: this.#skip() }) as QueryOptions);

  query = pokemonApi.endpoints.getPokemonByName.useQuery(this.#name, this.#options);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intervalId: any;

  ngOnInit(): void {
    this.intervalId = setInterval(() => this.#skip.update((skip) => !skip), 10);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
