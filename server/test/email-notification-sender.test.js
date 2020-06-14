const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mailgun = require('../mailgun');
const i18n = require('../i18n');
const config = require('../config');
const { insertStmt } = require('../database');
const emailNotificationSender = require('../email-notification-sender');

const expect = chai.expect;
chai.use(sinonChai);

describe('emailNotificationSender', () => {
  before(() => {
    i18n.init();
    config.init();
  });

  it('notifies about new photo', () => {
    sinon.stub(mailgun, 'sendEmail');

    insertStmt.run({
      file_name: 'test.jpg',
      email_created_at: Math.floor(Date.now() / 1000),
      ocr_created_at: Math.floor(Date.now() / 1000),
      temperature: 13,
      created_at: Math.floor(Date.now() / 1000)
    });

    // Fake time for cron
    const clock = sinon.useFakeTimers(new Date('2019-12-17T02:55:00').getTime());

    emailNotificationSender.init();

    clock.tick(1000 * 60 * 10); // 10 minutes

    expect(mailgun.sendEmail).to.have.been.calledWith({
      from: process.env.MAILGUN_FROM,
      to: process.env.MAILGUN_FROM,
      bcc: process.env.MAILGUN_TO,
      subject: 'email.subject',
      text: 'email.body'
    });
  });
});
