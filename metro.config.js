const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for CSS files
config.resolver.assetExts.push('css');
config.resolver.sourceExts.push('css');

// Add CSS transformer for web builds
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-css-transformer'),
};

// Basic configuration to prevent file watcher timeouts
config.watchFolders = [__dirname];
config.maxWorkers = 2;

// Cache configuration for better performance
config.cacheVersion = '1.0';

module.exports = config;