function get(name) {
  const rawValue = process.env[name.toUpperCase()];

  if (rawValue === 'true') {
    return true;
  }
  if (rawValue === 'false') {
    return false;
  }
  return rawValue;
}

module.exports = {
  get,
  production: process.env.NODE_ENV === 'production',
  test: process.env.NODE_ENV === 'test',
  development: process.env.NODE_ENV === 'development'
};
