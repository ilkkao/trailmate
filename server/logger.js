function info(...args) {
  console.log(...args); // eslint-disable-line no-console
}

function warn(...args) {
  console.warn(...args);
}

function error(...args) {
  console.error(...args);
}

module.exports = {
  info,
  warn,
  error
};
