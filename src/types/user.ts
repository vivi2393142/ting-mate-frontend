export enum UserTextSize {
  STANDARD = 'STANDARD', // default
  LARGE = 'LARGE',
}

export interface User {
  email: string;
  name: string;
  settings: {
    textSize: UserTextSize;
  };
}
