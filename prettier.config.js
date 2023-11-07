// prettier.config.js
module.exports = {
  semi: false,
  trailingComma: 'es5',
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  // https://github.com/tailwindlabs/prettier-plugin-tailwindcss#compatibility-with-other-prettier-plugins
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
}
