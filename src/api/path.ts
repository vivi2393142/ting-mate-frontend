const API_PATH = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  // User
  USER_ME: '/user/me',
  USER_SETTINGS: '/user/settings',
  USER_ROLE_TRANSITION: '/user/role/transition',
  // Task
  TASKS: '/tasks',
  // Links & Invitations
  USER_LINKS: '/user/links',
  USER_INVITATIONS_GENERATE: '/user/invitations/generate',
  USER_INVITATIONS_ACCEPT: '/user/invitations',
  // User Locations
  USER_LOCATION: '/user/location',
  USER_LINKED_LOCATION: '/user/linked-location',
  USER_CAN_GET_LOCATION: '/user/can-get-location',
  SAFE_ZONE: '/safe-zone',
  PLACE_SEARCH: '/places/search',
};

export default API_PATH;
