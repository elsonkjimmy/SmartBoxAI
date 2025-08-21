module.exports = {
  presets: ['@react-native/babel-preset'], // ✅ corrigé ici
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      allowUndefined: true,
    }],
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-shorthand-properties',
    '@babel/plugin-transform-template-literals',
    'react-native-reanimated/plugin', // doit rester en dernier
  ],
};
