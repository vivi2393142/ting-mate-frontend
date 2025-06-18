import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUSCommon from './locales/en-US/common.json';
import enUSExplore from './locales/en-US/explore.json';
import enUSHome from './locales/en-US/home.json';

import zhHantTWCommon from './locales/zh-Hant-TW/common.json';
import zhHantTWExplore from './locales/zh-Hant-TW/explore.json';
import zhHantTWHome from './locales/zh-Hant-TW/home.json';

export const defaultNS = 'common';
export const resources = {
  'en-US': {
    common: enUSCommon,
    home: enUSHome,
    explore: enUSExplore,
  },
  'zh-Hant-TW': {
    common: zhHantTWCommon,
    home: zhHantTWHome,
    explore: zhHantTWExplore,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'en-US',
  fallbackLng: 'en-US',
  ns: ['common', 'home', 'explore'],
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
