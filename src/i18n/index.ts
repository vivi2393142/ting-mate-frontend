import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUSAccountLinking from '@/i18n/locales/en-US/accountLinking.json';
import enUSActivityLog from '@/i18n/locales/en-US/activityLog.json';
import enUSCommon from '@/i18n/locales/en-US/common.json';
import enUSConnect from '@/i18n/locales/en-US/connect.json';
import enUSHome from '@/i18n/locales/en-US/home.json';
import enUSLogin from '@/i18n/locales/en-US/login.json';
import enUSRoutes from '@/i18n/locales/en-US/routes.json';
import enUSSettings from '@/i18n/locales/en-US/settings.json';
import enUSTaskForm from '@/i18n/locales/en-US/taskForm.json';

import zhHantTWAccountLinking from '@/i18n/locales/zh-Hant-TW/accountLinking.json';
import zhHantTWActivityLog from '@/i18n/locales/zh-Hant-TW/activityLog.json';
import zhHantTWCommon from '@/i18n/locales/zh-Hant-TW/common.json';
import zhHantTWConnect from '@/i18n/locales/zh-Hant-TW/connect.json';
import zhHantTWHome from '@/i18n/locales/zh-Hant-TW/home.json';
import zhHantTWLogin from '@/i18n/locales/zh-Hant-TW/login.json';
import zhHantTWRoutes from '@/i18n/locales/zh-Hant-TW/routes.json';
import zhHantTWSettings from '@/i18n/locales/zh-Hant-TW/settings.json';
import zhHantTWTaskForm from '@/i18n/locales/zh-Hant-TW/taskForm.json';

export const defaultNS = 'common';
export const resources = {
  'en-US': {
    common: enUSCommon,
    home: enUSHome,
    connect: enUSConnect,
    settings: enUSSettings,
    taskForm: enUSTaskForm,
    login: enUSLogin,
    accountLinking: enUSAccountLinking,
    activityLog: enUSActivityLog,
    routes: enUSRoutes,
  },
  'zh-Hant-TW': {
    common: zhHantTWCommon,
    home: zhHantTWHome,
    connect: zhHantTWConnect,
    settings: zhHantTWSettings,
    taskForm: zhHantTWTaskForm,
    login: zhHantTWLogin,
    accountLinking: zhHantTWAccountLinking,
    activityLog: zhHantTWActivityLog,
    routes: zhHantTWRoutes,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'en-US',
  fallbackLng: 'en-US',
  ns: [
    'common',
    'home',
    'connect',
    'settings',
    'taskForm',
    'login',
    'accountLinking',
    'activityLog',
    'routes',
  ],
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
