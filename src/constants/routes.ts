const ROUTES = {
  HOME: '/',
  SETTINGS: '/settings',
  CONNECT: '/connect',
  ACCOUNT_LINKING: '/account-linking',
  ROLE_SELECTION: '/role-selection',
  EDIT_NOTIFICATION: '/edit-notification',
  EDIT_NAME: '/edit-name',
  LOGIN: '/login',
  ADD_TASK: '/add-task',
  EDIT_TASK: '/edit-task',
  ADD_EMERGENCY_CONTACT: '/add-emergency-contact',
  EDIT_EMERGENCY_CONTACT: '/edit-emergency-contact',
  LOG_DETAIL: '/log-detail',
  NOTE_EDIT: '/note-edit',
  EDIT_SAFE_ZONE: '/edit-safe-zone',
  NOTIFICATIONS: '/notifications',
  // Onboarding
  ONBOARDING_SLIDES: '/onboarding-slides',
  ONBOARDING_ROLE: '/onboarding-role',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

export default ROUTES;
