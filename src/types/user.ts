import type { ContactMethod } from '@/types/connect';

export enum UserTextSize {
  STANDARD = 'STANDARD', // default
  LARGE = 'LARGE',
}

export enum UserDisplayMode {
  FULL = 'FULL', // default
  SIMPLE = 'SIMPLE',
}

export interface ReminderSettings {
  taskReminder: boolean;
  overdueReminder: {
    enabled: boolean;
    delayMinutes: number;
    repeat: boolean;
  };
  safeZoneExitReminder: boolean;
  taskCompletionNotification: boolean;
  taskChangeNotification: boolean;
}

export interface MergedReminderSettings {
  enableReminder: boolean;
  enableOverdueReminder: boolean;
  delayMinutes: number;
}

export interface UserLink {
  email: string;
  name: string;
  role: Role;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  methods: ContactMethod[];
}

export interface UserSettings {
  name: string;
  linked: UserLink[];
  textSize: UserTextSize;
  displayMode: UserDisplayMode;
  reminder: ReminderSettings;
  emergencyContacts: EmergencyContact[];
  allowShareLocation: boolean;
  // language: 'zh-TW' | 'en-US'; // TODO: implement language
}

export enum Role {
  CARERECEIVER = 'CARERECEIVER',
  CAREGIVER = 'CAREGIVER',
}

export interface User {
  email?: string;
  role: Role;
  settings: UserSettings;
}
