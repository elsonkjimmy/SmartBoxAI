module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-shorthand-properties',
    '@babel/plugin-transform-template-literals',
    'react-native-reanimated/plugin', // doit toujours être en dernier
  ],
};
