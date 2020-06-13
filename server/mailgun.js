const mailgun = require('mailgun-js');

const sender = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });

function sendEmail(data) {
  sender.messages().send(data);
}

module.exports = {
  sendEmail
};
