/**
 * ESLint Configuration (Flat Config - v9+)
 * FlexPOS Backend - Node.js/Express API
 */

const globals = require('globals');

module.exports = [
  // ========================================
  // Configuration globale
  // ========================================
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
    rules: {
      // ========================================
      // Possible Errors (Bugs potentiels)
      // ========================================
      'no-console': 'off', // Autorisé dans un backend Node.js
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'warn',

      // ========================================
      // Best Practices
      // ========================================
      'eqeqeq': ['error', 'always'], // === au lieu de ==
      'curly': ['error', 'all'], // Toujours des accolades
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-var': 'warn', // Utiliser const/let
      'prefer-const': 'warn',
      'no-new-func': 'error',
      'no-return-await': 'error',
      'require-await': 'warn',

      // ========================================
      // Sécurité
      // ========================================
      'no-new-require': 'error',
      'no-path-concat': 'error',

      // ========================================
      // Code Style (minimal)
      // ========================================
      'semi': ['error', 'always'],
      'quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      'indent': [
        'error',
        2,
        {
          SwitchCase: 1,
        },
      ],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-spacing': 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true,
        },
      ],

      // ========================================
      // Specific to Node.js/Express
      // ========================================
      'no-process-exit': 'off', // Autorisé pour scripts CLI
    },
  },

  // ========================================
  // Fichiers ignorés
  // ========================================
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      'logs/',
      '*.log',
      '.env',
      '.env.*',
      'database/',
      'migrations/',
      'uploads/',
    ],
  },

  // ========================================
  // Configuration spécifique tests
  // ========================================
  {
    files: ['tests/**/*.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-expressions': 'off',
    },
  },
];
