export enum UserTextSize {
  STANDARD = 'STANDARD', // default
  LARGE = 'LARGE',
}

export enum UserDisplayMode {
  FULL = 'FULL', // default
  SIMPLE = 'SIMPLE',
}

export interface User {
  email: string;
  name: string;
  settings: {
    textSize: UserTextSize;
    displayMode: UserDisplayMode;
  };
}
