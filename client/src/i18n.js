import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import dateFnsLocaleFi from 'date-fns/locale/fi';
import dateFnsLocaleEnUs from 'date-fns/locale/en-US';
import fi from './locales/fi.json';
import enUs from './locales/en-us.json';
import overrides from './locales/overrides.json';

const dateFnsLocales = {
  fi: dateFnsLocaleFi,
  'en-us': dateFnsLocaleEnUs
};

const resources = {
  overrides: { translation: overrides },
  fi: { translation: fi },
  'en-us': { translation: enUs }
};

export const locale = process.env.REACT_APP_LOCALE;

export const dateFnsLocale = dateFnsLocales[locale];

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lowerCaseLng: true,
    fallbackLng: locale,
    lng: 'overrides',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
