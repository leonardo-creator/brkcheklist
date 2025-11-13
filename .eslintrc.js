module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'warn',
    'no-console': 'off',
    '@next/next/no-html-link-for-pages': 'warn',
    '@next/next/no-img-element': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
