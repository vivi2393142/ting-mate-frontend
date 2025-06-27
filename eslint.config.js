import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import i18nextPlugin from 'eslint-plugin-i18next';
import pluginImport from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
      i18next: i18nextPlugin,
      import: pluginImport,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'error',
      'react-native/no-raw-text': 'off', // Use i18next/no-literal-string instead
      'react-native/sort-styles': 'error',
      'react-native/no-inline-styles': 'error',
      'react-native/no-color-literals': 'error',
      'react-native/no-single-element-style-arrays': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-nested-ternary': 'error',
      'object-shorthand': 'error',
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            exclude: ['href', 'name', 'variant', 'outlineColor', 'activeOutlineColor', 'icon'],
          },
          callees: {
            exclude: ['format'],
          },
        },
      ],
      '@typescript-eslint/no-require-imports': [
        'error',
        {
          allow: ['\\.(png|jpg|jpeg|gif|svg|ttf|mp3)$'],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: ['.'],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
      },
    },
  },
  prettier,
];
