const SMTPServer = require('smtp-server').SMTPServer;
const simpleParser = require('mailparser').simpleParser;
const imageProcessor = require('./image-processor');
const config = require('./config');
const logger = require('./logger');

function init() {
  const server = new SMTPServer({
    size: 1024 * 1024 * 50,
    authOptional: true,
    allowInsecureAuth: true,
    disableReverseLookup: true,
    maxClients: 5,
    onAuth: handleOnAuth,
    onRcptTo: handleOnRcptTo,
    onData: handleOnData
  });

  const port = config.get('smtp_server_port');
  server.listen(port, () => {
    logger.info(`SMTP server started, port: ${port}`);
  });
}

function handleOnAuth(auth, session, callback) {
  callback(null, { user: 1 }); // Accept everyone
}

function handleOnRcptTo(address, session, callback) {
  // Do the real authentication, to address is the password
  const correctEmail = config.get('secret_email_address');
  if (address.address !== correctEmail) {
    logger.warn(`Received email with wrong to-field "${address.address}", expected "${correctEmail}"`);
    return callback(new Error('Invalid address'));
  }
  return callback();
}

async function handleOnData(stream, session, callback) {
  try {
    const email = await simpleParser(stream, {
      skipHtmlToText: true,
      skipImageLinks: true,
      skipTextToHtml: true,
      skipTextLinks: true
    });
    processEmail(email);
  } catch (e) {
    logger.error(`Failed to parse incoming email, error: ${e}`);
  }

  callback();
}

function processEmail(message) {
  if (message.attachments.length === 0) {
    logger.error('No attachments in the email');
    return;
  }
  if (message.attachments.length > 1) {
    logger.warn(`Unexpected amount of attachments (${message.attachments.length}) in the email`);
  }
  imageProcessor.processNewImage(message.date, message.attachments[0].content);
}

module.exports = {
  init
};
