import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { provideStoreApi } from 'ngrx-rtk-query';
import { PokemonComponent } from './pokemon/pokemon.component';
import { pokemonApi } from './services';
import { SkipContainerComponent } from './skip-container/skip-container.component';
import { SkipRoutingModule } from './skip-routing.module';

@NgModule({
  declarations: [SkipContainerComponent, PokemonComponent],
  imports: [CommonModule, SkipRoutingModule],
  providers: [
    // Lazy RTK Query
    provideStoreApi(pokemonApi),
  ],
})
export class SkipModule {}
