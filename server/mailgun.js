const mailgun = require('mailgun-js');
const config = require('./config');

const sender = mailgun({
  apiKey: config.get('mailgun_api_key'),
  domain: config.get('mailgun_domain')
});

function sendEmail(data) {
  sender.messages().send(data);
}

module.exports = {
  sendEmail
};
