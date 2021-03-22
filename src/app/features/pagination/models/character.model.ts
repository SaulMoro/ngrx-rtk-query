import { CharacterGender } from './character-gender.enum';
import { CharacterSpecies } from './character-species.enum';
import { CharacterStatus } from './character-status.enum';

export interface Character {
  id: number;
  name: string;
  status: CharacterStatus;
  species: CharacterSpecies;
  type: string;
  gender: CharacterGender;
  image: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  episode: string[];
}
