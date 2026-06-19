module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated MUST be the last plugin in this array
      'react-native-reanimated/plugin',
    ],
  };
};