const MANDATORY_OPTIONS = [
  'http_server_url',
  'secret_email_address',
  'camera_tz_offset',
  'image_dir',
  'db_file',
  'admin_password'
];

const OPTIONAL_OPTIONS_WITH_DEFAULTS = {
  locale: 'en-us',
  http_server_port: 3001,
  smtp_server_port: 2526,
  mailgun_api_key: null,
  mailgun_domain: null,
  mailgun_from: null,
  mailgun_to: null,
  google_analytics_id: null,
  verbose: false
};

const options = {};

function init() {
  MANDATORY_OPTIONS.forEach(name => {
    const envVariableName = name.toUpperCase();
    const rawValue = process.env[envVariableName];

    if (rawValue === undefined) {
      throw new Error(`Mandatory environment variable ${envVariableName} not set`);
    }

    options[name] = parseValue(rawValue);
  });

  Object.keys(OPTIONAL_OPTIONS_WITH_DEFAULTS).forEach(name => {
    const envVariableName = name.toUpperCase();
    const rawValue = process.env[envVariableName];

    options[name] = rawValue === undefined ? OPTIONAL_OPTIONS_WITH_DEFAULTS[name] : parseValue(rawValue);
  });
}

function parseValue(rawValue) {
  if (rawValue === 'true') {
    return true;
  }
  if (rawValue === 'false') {
    return false;
  }
  if (rawValue.match(/^[0-9.]+$/)) {
    return parseInt(rawValue);
  }

  return rawValue;
}

function get(name) {
  if (!Object.keys(options).includes(name)) {
    throw new Error(`Unknown option: ${name}`);
  }

  return options[name];
}

function getAll() {
  return options;
}

module.exports = {
  init,
  get,
  getAll,
  production: process.env.NODE_ENV === 'production',
  test: process.env.NODE_ENV === 'test',
  development: process.env.NODE_ENV === 'development'
};
