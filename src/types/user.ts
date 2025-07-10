export enum UserTextSize {
  STANDARD = 'STANDARD', // default
  LARGE = 'LARGE',
}

export enum UserDisplayMode {
  FULL = 'FULL', // default
  SIMPLE = 'SIMPLE',
}

export interface ReminderSettings {
  taskTimeReminder: boolean;
  overdueReminder: {
    enabled: boolean;
    delayMinutes: number;
    repeat: boolean;
  };
  safeZoneReminder: boolean;
}

export interface UserSettings {
  textSize: UserTextSize;
  displayMode: UserDisplayMode;
  reminder: ReminderSettings;
  // language: 'zh-TW' | 'en-US'; // TODO: implement language
}

export enum Role {
  CARERECEIVER = 'CARERECEIVER',
  CAREGIVER = 'CAREGIVER',
}

export interface User {
  email: string;
  name: string;
  role: Role;
  /* A caregiver can only link to one carereceiver,
  while a carereceiver can link to multiple caregivers */
  linked: string[];
  settings: UserSettings;
}
