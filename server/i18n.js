const path = require('path');
const fs = require('fs');
const i18next = require('i18next');
const config = require('./config');
const logger = require('./logger');

const translations = {};

function init() {
  const langFiles = fs.readdirSync(path.join(__dirname, '../locales'));

  logger.info('Loading translations...');

  langFiles.forEach(langFile => {
    const translation = JSON.parse(fs.readFileSync(path.join(__dirname, `../locales/${langFile}`), 'utf8'));
    const [lang] = langFile.split('.');

    translations[lang] = { translation };
  });

  i18next.init({
    resources: translations,
    lowerCaseLng: true,
    fallbackLng: config.test ? 'cimode' : config.get('locale'),
    lng: 'overrides',
    interpolation: {
      escapeValue: false
    }
  });

  return translations;
}

function t(...args) {
  return i18next.t(...args);
}

module.exports = {
  init,
  t,
  translations
};
