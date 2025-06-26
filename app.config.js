export default {
  expo: {
    name: 'Ting Mate',
    scheme: 'tingmate',
    slug: 'ting-mate',
    owner: 'vivi2393142',
    userInterfaceStyle: 'automatic',
    version: '1.0.0',
    icon: './src/assets/images/icon.png',
    newArchEnabled: true,
    orientation: 'portrait',
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#FFFFFF',
        foregroundImage: './src/assets/images/adaptive-icon.png',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: 'metro',
      favicon: './src/assets/images/favicon.png',
      output: 'static',
    },
    experiments: {
      typedRoutes: true,
    },
    plugins: [
      'expo-router',
      [
        'expo-audio',
        {
          microphonePermission: 'Allow Ting Mate to access your microphone.',
        },
      ],
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
  },
};
