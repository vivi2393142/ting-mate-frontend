export default {
  expo: {
    name: 'Ting Mate',
    scheme: 'tingmate',
    slug: 'ting-mate',
    projectId: '5852296e-71df-40cf-84d2-2516ea906268',
    owner: 'vivi2393142',
    userInterfaceStyle: 'automatic',
    version: '1.0.0',
    icon: './src/assets/images/icon.png',
    newArchEnabled: true,
    orientation: 'portrait',
    notification: {
      icon: './src/assets/images/icon.png',
    },
    ios: {
      bundleIdentifier: 'com.vivi2393142.tingmate',
      supportsTablet: true,
    },
    android: {
      package: 'com.vivi2393142.tingmate',
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
