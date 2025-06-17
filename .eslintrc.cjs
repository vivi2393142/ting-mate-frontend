module.exports = {
  root: true,
  extends: [
    'universe/native',
    'universe/shared/typescript-analysis',
    'plugin:react-native-a11y/all',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
  rules: {
    // Allow require() for asset files
    '@typescript-eslint/no-require-imports': [
      'error',
      { allow: ['\\.(png|jpg|jpeg|gif|ttf|otf|svg)$'] },
    ],
    // Allow raw text in certain components
    'react-native/no-raw-text': ['error', { skip: ['Button', 'Text'] }],
    // Enforce accessibility
    'react-native-a11y/has-valid-accessibility-descriptors': 'error',
    'react-native-a11y/has-accessibility-hint': 'error',
    // Style ordering
    'react-native/sort-styles': ['error', 'asc'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
