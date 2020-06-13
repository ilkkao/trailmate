import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import dateFnsLocaleFi from 'date-fns/locale/fi';
import dateFnsLocaleEnUs from 'date-fns/locale/en-US';

const dateFnsLocales = {
  fi: dateFnsLocaleFi,
  'en-us': dateFnsLocaleEnUs
};

export const locale = window.config.locale;

export const dateFnsLocale = dateFnsLocales[locale];

i18next.use(initReactI18next).init({
  resources: window.config.translations,
  lowerCaseLng: true,
  fallbackLng: locale,
  lng: 'overrides',
  interpolation: {
    escapeValue: false // react already safes from xss
  }
});

export default i18next;
