import 'i18next';

import { defaultNS, resources } from './index';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en-US'];
    returnNull: false;
    keySeparator: '.';
    nsSeparator: ':';
  }
}
