export enum CharacterGender {
  female = 'female',
  male = 'male',
  genderless = 'genderless',
  unknown = 'unknown',
}

export type CharacterGenderStrings = keyof typeof CharacterGender;
