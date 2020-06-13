const path = require('path');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const config = require('./config');

i18next.use(Backend).init({
  initImmediate: false,
  backend: {
    loadPath: path.join(__dirname, '../client/src/locales/{{lng}}.json')
  }
});

i18next.changeLanguage(config.test ? 'cimode' : config.get('locale'));

function t(...args) {
  return i18next.t(...args);
}

module.exports = {
  t
};
