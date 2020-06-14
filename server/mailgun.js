const mailgun = require('mailgun-js');
const log = require('./logger');
const config = require('./config');
const logger = require('./logger');

let sender;
let disabled = false;

function init() {
  if (!(config.get('mailgun_api_key') && config.get('mailgun_domain'))) {
    disabled = true;
    log.info('Email sending not enabled');
  }

  sender = mailgun({
    apiKey: config.get('mailgun_api_key'),
    domain: config.get('mailgun_domain')
  });
}
function sendEmail(data) {
  if (disabled) {
    return;
  }

  sender.messages().send({
    from: config.get('mailgun_from'),
    to: config.get('mailgun_from'),
    bcc: config.get('mailgun_to'),
    ...data
  });

  logger.info(`Sent email to ${config.get('mailgun_to')}`);
}

module.exports = {
  init,
  sendEmail
};
