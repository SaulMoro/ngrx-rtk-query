export enum CharacterStatus {
  alive = 'alive',
  dead = 'dead',
  unknown = 'unknown',
}

export type CharacterStatusStrings = keyof typeof CharacterStatus;
