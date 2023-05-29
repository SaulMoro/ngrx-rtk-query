import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PokemonComponent } from './pokemon/pokemon.component';
import { providePokemonQuery } from './services';
import { SkipContainerComponent } from './skip-container/skip-container.component';
import { SkipRoutingModule } from './skip-routing.module';

@NgModule({
  declarations: [SkipContainerComponent, PokemonComponent],
  imports: [CommonModule, SkipRoutingModule],
  providers: [
    // Lazy RTK Query
    providePokemonQuery(),
  ],
})
export class SkipModule {}
