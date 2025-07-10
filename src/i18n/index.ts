import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUSCommon from '@/i18n/locales/en-US/common.json';
import enUSConnect from '@/i18n/locales/en-US/connect.json';
import enUSHome from '@/i18n/locales/en-US/home.json';
import enUSLogin from '@/i18n/locales/en-US/login.json';
import enUSSettings from '@/i18n/locales/en-US/settings.json';
import enUSTaskForm from '@/i18n/locales/en-US/taskForm.json';

import zhHantTWCommon from '@/i18n/locales/zh-Hant-TW/common.json';
import zhHantTWConnect from '@/i18n/locales/zh-Hant-TW/connect.json';
import zhHantTWHome from '@/i18n/locales/zh-Hant-TW/home.json';
import zhHantTWLogin from '@/i18n/locales/zh-Hant-TW/login.json';
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
  },
  'zh-Hant-TW': {
    common: zhHantTWCommon,
    home: zhHantTWHome,
    connect: zhHantTWConnect,
    settings: zhHantTWSettings,
    taskForm: zhHantTWTaskForm,
    login: zhHantTWLogin,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'en-US',
  fallbackLng: 'en-US',
  ns: ['common', 'home', 'connect', 'settings', 'taskForm'],
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
