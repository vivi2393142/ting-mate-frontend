import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import expoConfig from 'eslint-config-expo/flat.js';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactNative from 'eslint-plugin-react-native';

import { defineConfig } from 'eslint/config';

export default defineConfig([
  expoConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      react,
      'react-native': reactNative,
      '@typescript-eslint': typescriptEslint,
      prettier,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactNative.configs.all.rules,
      'react/react-in-jsx-scope': 'off',
      'react-native/no-unused-styles': 'error',
      'react-native/no-inline-styles': 'error',
      'react-native/no-color-literals': 'error',
      'react-native/no-raw-text': ['error', { skip: ['ThemedText'] }],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'import/no-default-export': 'off',
      'import/prefer-default-export': [
        'error',
        {
          target: 'single',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
      'react-native/style-sheet-object-names': ['StyleSheet', 'EStyleSheet'],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
]);
