const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const config = require('../config');

const expect = chai.expect;
chai.use(sinonChai);

describe('config', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('raises an error if mandatory option is missing', () => {
    sandbox.stub(process, 'env').value({});

    expect(config.init).to.throw(/Mandatory environment variable [A-Z_]+ not set/);
  });

  it('accepts minimal configuration and uses defaults', () => {
    sandbox.stub(process, 'env').value({
      HTTP_SERVER_URL: 'http://example.com',
      SECRET_EMAIL_ADDRESS: 'barfoo@example.com',
      CAMERA_TZ_OFFSET: '3',
      IMAGE_DIR: '../test-data',
      DB_FILE: '../test-data/database.db',
      ADMIN_PASSWORD: 'foobar'
    });

    expect(config.init).to.not.throw();

    expect(config.getAll()).to.eql({
      http_server_url: 'http://example.com',
      secret_email_address: 'barfoo@example.com',
      camera_tz_offset: 3,
      image_dir: '../test-data',
      db_file: '../test-data/database.db',
      admin_password: 'foobar',
      google_analytics_id: null,
      http_server_port: 3001,
      locale: 'en-us',
      mailgun_api_key: null,
      mailgun_domain: null,
      mailgun_from: null,
      mailgun_to: null,
      smtp_server_port: 2526,
      verbose: false
    });
  });

  it('parses optional option', () => {
    sandbox.stub(process, 'env').value({
      HTTP_SERVER_URL: 'http://example.com',
      SECRET_EMAIL_ADDRESS: 'barfoo@example.com',
      CAMERA_TZ_OFFSET: '3',
      IMAGE_DIR: '../test-data',
      DB_FILE: '../test-data/database.db',
      ADMIN_PASSWORD: 'foobar',
      VERBOSE: 'true'
    });

    expect(config.init).to.not.throw();

    expect(config.get('verbose')).to.eql(true);
  });
});
