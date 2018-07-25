module.exports = {
  extends: [
    'airbnb-base',
    'prettier'
  ],
  parser: 'babel-eslint',
  rules: {
    'prettier/prettier': [
      'error', {
        singleQuote: true
      }
    ],
    'no-restricted-syntax': 0,
    'no-use-before-define': ['error', { 'functions': false, 'classes': true }],
    'no-param-reassign': ['error', { 'props': false }],
    'no-plusplus': ['off'],
    'class-methods-use-this': ['off'],
    'radix': ['error', 'as-needed'],
    'prefer-destructuring': ['off'],
    'import/no-extraneous-dependencies': ['error', {'devDependencies': true, 'optionalDependencies': false}],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-continue': ['off'],
    'jsx-a11y/no-static-element-interactions': ['off'], // TODO: Consider
    'arrow-parens': ['off']
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'prettier'
  ]
};
