const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mailgun = require('../mailgun');
const { insertStmt } = require('../database');
const emailNotificationSender = require('../email-notification-sender');

const expect = chai.expect;
chai.use(sinonChai);

describe('emailNotificationSender', () => {
  it('adds 1 + 2 to equal 3', () => {
    sinon.stub(mailgun, 'sendEmail');

    insertStmt.run({
      file_name: 'test.jpg',
      email_created_at: Math.floor(Date.now() / 1000),
      ocr_created_at: Math.floor(Date.now() / 1000),
      temperature: 13,
      created_at: Math.floor(Date.now() / 1000)
    });

    const clock = sinon.useFakeTimers(Date.now());

    emailNotificationSender.init();

    clock.tick(1000 * 60 * 60 * 24);

    expect(mailgun.sendEmail).to.have.been.calledWith({
      from: process.env.MAILGUN_FROM,
      to: process.env.MAILGUN_FROM,
      bcc: process.env.MAILGUN_TO,
      subject: 'email.subject',
      text: 'email.body'
    });
  });
});
