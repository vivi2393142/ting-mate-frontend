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
    ios: {
      bundleIdentifier: 'com.vivi2393142.tingmate',
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: ['location', 'fetch'],
      },
    },
    android: {
      package: 'com.vivi2393142.tingmate',
      adaptiveIcon: {
        backgroundColor: '#FFFFFF',
        foregroundImage: './src/assets/images/adaptive-icon.png',
      },
      edgeToEdgeEnabled: true,
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
        'WAKE_LOCK',
      ],
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
          imageWidth: 200,
          resizeMode: 'contain',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow Ting Mate to access your location even when the app is closed for background location tracking.',
          locationAlwaysPermission:
            'Allow Ting Mate to access your location even when the app is closed for background location tracking.',
          locationWhenInUsePermission:
            'Allow Ting Mate to access your location when the app is open.',
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
        },
      ],
    ],
  },
};
