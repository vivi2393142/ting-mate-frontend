import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { Tabs } from 'expo-router';

import useAppTheme from '@/hooks/useAppTheme';

import IconSymbol from '@/components/atoms/IconSymbol';
import HapticTab from '@/components/molecules/HapticTab';

const TabLayout = () => {
  const theme = useAppTheme();
  const { t } = useTranslation('common');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: theme.colors.surface,
            position: 'absolute',
          },
          default: {
            backgroundColor: theme.colors.surface,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('Home'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('Explore'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      {/* TODO: remove this screen */}
      <Tabs.Screen
        name="themeTest"
        options={{
          title: t('Theme Test'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paintbrush.fill" color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
