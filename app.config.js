export default {
  expo: {
    android: {
      adaptiveIcon: {
        backgroundColor: '#FFFFFF',
        foregroundImage: './src/assets/images/adaptive-icon.png',
      },
      edgeToEdgeEnabled: true,
    },
    experiments: {
      typedRoutes: true,
    },
    icon: './src/assets/images/icon.png',
    ios: {
      supportsTablet: true,
    },
    name: 'Ting Mate',
    newArchEnabled: true,
    orientation: 'portrait',
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#FFFFFF',
          image: './src/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
        },
      ],
    ],
    scheme: 'tingmate',
    slug: 'ting-mate',
    userInterfaceStyle: 'automatic',
    version: '1.0.0',
    web: {
      bundler: 'metro',
      favicon: './src/assets/images/favicon.png',
      output: 'static',
    },
  },
};
