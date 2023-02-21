import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PokemonQueryModule } from './services';
import { SkipContainerComponent } from './skip-container/skip-container.component';
import { SkipRoutingModule } from './skip-routing.module';
import { PokemonComponent } from './pokemon/pokemon.component';

@NgModule({
  declarations: [SkipContainerComponent, PokemonComponent],
  imports: [CommonModule, SkipRoutingModule, PokemonQueryModule],
})
export class SkipModule {}
