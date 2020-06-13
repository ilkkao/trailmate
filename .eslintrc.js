module.exports = {
  extends: [
    'airbnb-base',
    'prettier'
  ],
  rules: {
    'prettier/prettier': [
      'error', {
        singleQuote: true
      }
    ],
    'no-restricted-syntax': ['off'],
    'no-use-before-define': ['error', { 'functions': false, 'classes': true }],
    'no-param-reassign': ['error', { 'props': false }],
    'no-plusplus': ['off'],
    'class-methods-use-this': ['off'],
    'radix': ['error', 'as-needed'],
    'prefer-destructuring': ['off'],
    'import/no-extraneous-dependencies': ['error', { 'devDependencies': true, 'optionalDependencies': false }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-continue': ['off'],
    'jsx-a11y/no-static-element-interactions': ['off'], // TODO: Consider
    'arrow-parens': ['off']
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: [
    'prettier',
  ],
  env: {
    mocha: true,
    node: true
  }
};
