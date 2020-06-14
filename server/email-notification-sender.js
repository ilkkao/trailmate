const cron = require('cron');
const { queryNewStmt } = require('./database');
const mailgun = require('./mailgun');
const { info } = require('./logger');
const { t } = require('./i18n');
const config = require('./config');

let newImageCron;

function init() {
  mailgun.init();

  newImageCron = new cron.CronJob('0 0 3 * * *', send);
  newImageCron.start();
}

function stop() {
  newImageCron.stop();
}

function send() {
  const newImageCount = queryNewStmt.get().new_images;

  if (newImageCount === 0) {
    info('No new images, skipping notifications');
    return;
  }

  mailgun.sendEmail({
    subject: t('email.subject', { count: newImageCount }),
    text: t('email.body', { url: config.get('http_server_url') })
  });

  info('Sent email notification');
}

module.exports = {
  init,
  stop
};
