module.exports = {
  extends: ['universe/native'],
  rules: {
    // Customize rules as needed
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
