import { useTranslation } from 'react-i18next';

import { Tabs } from 'expo-router';

import useAppTheme from '@/hooks/useAppTheme';

import IconSymbol from '@/components/atoms/IconSymbol';

const tabScreensSettings = [
  {
    name: 'connect',
    titleKey: 'Connect',
    iconName: 'person.2.fill',
  },
  {
    name: 'index',
    titleKey: 'Home',
    iconName: 'house.fill',
  },
  {
    name: 'settings',
    titleKey: 'Settings',
    iconName: 'gearshape.fill',
  },
] as const;

const TabLayout = () => {
  const { t } = useTranslation('common');
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      {tabScreensSettings.map(({ name, titleKey, iconName }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarLabelStyle: {
              fontSize: theme.fonts.labelSmall.fontSize,
              lineHeight: theme.fonts.labelSmall.lineHeight,
            },
            title: t(titleKey),
            tabBarAccessibilityLabel: t(titleKey),
            tabBarIcon: ({ color }) => (
              <IconSymbol name={iconName} color={color} size={theme.iconSize.small} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
