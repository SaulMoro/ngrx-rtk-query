import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaginationRoutingModule } from './pagination-routing.module';
import { CharactersListComponent } from './characters-list/characters-list.component';
import { RickMortyQueryModule } from './services';
import { CharacterCardComponent } from './character-card/character-card.component';
import { PaginatorComponent } from './paginator/paginator.component';

@NgModule({
  declarations: [CharactersListComponent, CharacterCardComponent, PaginatorComponent],
  imports: [CommonModule, PaginationRoutingModule, RickMortyQueryModule],
})
export class PaginationModule {}
