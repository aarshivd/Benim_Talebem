module.exports = function (api) {
  // api.env() kullanıldığında cache'i dinamik hale getirmek gerekir
  api.cache.using(() => process.env.NODE_ENV);

  const isTest = process.env.NODE_ENV === 'test';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
      // Drizzle migration .sql dosyalarını inline import için
      ['inline-import', { extensions: ['.sql'] }],
      // react-native-reanimated/plugin test ortamında çalışmaz
      ...(isTest ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
