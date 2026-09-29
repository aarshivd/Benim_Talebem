const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// @/ alias
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
};

// Drizzle migration dosyaları (.sql) için Metro desteği
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'sql');
config.resolver.sourceExts = [...(config.resolver.sourceExts ?? []), 'sql'];

module.exports = config;
