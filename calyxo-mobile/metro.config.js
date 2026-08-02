const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [
    path.resolve(__dirname, './polyfill.js'),
  ],
};

module.exports = config;
