module.exports = function createEslintProfile(tsconfigRootDir) {
  return {
    parser: '@typescript-eslint/parser',
    extends: 'airbnb-typescript-prettier',
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
      project: './tsconfig.eslint.json',
      tsconfigRootDir,
    },
    ignorePatterns: ['**/*.d.ts', '**/*.config.js', '**/*.js'],
    env: {
      jest: true,
    },
    rules: {
      'react/jsx-props-no-spreading': ['off'],
      'class-methods-use-this': 'off',
      'react/prop-types': 'off',
      'import/no-extraneous-dependencies': ['off'],
      'import/no-named-as-default': ['off'],
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/no-unused-vars-experimental': ['off'],
      'no-useless-constructor': ['off'],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'jsx-a11y/anchor-is-valid': ['off'],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      // This rule doesn't work with TS
      'react/static-property-placement': ['off'],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@material-ui/core',
              message:
                "Please use specific imports instead. Example: '@material-ui/core/Button'.",
            },
            {
              name: 'lodash',
              message: "Please use specific imports like 'lodash/get' instead.",
            },
          ],
        },
      ],
    },
    overrides: [
      {
        files: ['*.tsx'],
        rules: {
          '@typescript-eslint/explicit-module-boundary-types': ['off'],
        },
      },
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
}
