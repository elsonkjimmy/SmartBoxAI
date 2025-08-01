module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-shorthand-properties',
    '@babel/plugin-transform-template-literals',
    'react-native-reanimated/plugin', // doit toujours être en dernier
  ],
};
