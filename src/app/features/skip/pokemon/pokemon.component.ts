import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { QueryOptions } from 'ngrx-rtk-query';
import { BehaviorSubject, map } from 'rxjs';
import { pokemonApi } from '../services';

@Component({
  selector: 'app-pokemon',
  template: `<ng-container *ngIf="query$ | async"></ng-container>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonComponent implements OnInit, OnChanges, OnDestroy {
  @Input() name!: string;

  nameBehavior: BehaviorSubject<string> = new BehaviorSubject<string>(this.name);
  name$ = this.nameBehavior.asObservable();

  skipBehavior: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  skip$ = this.skipBehavior.asObservable();
  options$ = this.skip$.pipe(map((skip) => ({ skip } as QueryOptions)));

  query$ = pokemonApi.endpoints.getPokemonByName.useQuery(this.name$, this.options$);

  intervalId: any;

  ngOnInit(): void {
    this.intervalId = setInterval(() => this.skipBehavior?.next(!this.skipBehavior.value), 10);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.nameBehavior.next(changes.name.currentValue);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
