export enum CharacterSpecies {
  human = 'Human',
  humanoid = 'Humanoid',
  alien = 'Alien',
  poopybutthole = 'Poopybutthole',
  mytholog = 'Mytholog',
  animal = 'Animal',
  vampire = 'Vampire',
  robot = 'Robot',
  cronenberg = 'Cronenberg',
  disease = 'Disease',
  unknown = 'unknown',
}

export type CharacterSpeciesStrings = keyof typeof CharacterSpecies;
