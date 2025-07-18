import { Tabs, usePathname } from 'expo-router';
import { StyleSheet } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import useRouteTranslation from '@/hooks/useRouteTranslation';
import { StaticTheme } from '@/theme';

import IconSymbol from '@/components/atoms/IconSymbol';
import VoiceCommandButton from '@/components/screens/Home/VoiceCommandButton';
import ROUTES from '@/constants/routes';

const tabScreensSettings = [
  {
    name: 'connect',
    titleKey: ROUTES.CONNECT,
    iconName: 'person.2.fill',
  },
  {
    name: 'index',
    titleKey: ROUTES.HOME,
    iconName: 'house.fill',
  },
  {
    name: 'settings',
    titleKey: ROUTES.SETTINGS,
    iconName: 'gearshape.fill',
  },
] as const;

const TabLayout = () => {
  const { tRoutes } = useRouteTranslation();
  const theme = useAppTheme();

  const pathName = usePathname();
  const isOnHomeScreen = pathName === ROUTES.HOME;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      {tabScreensSettings.map(({ name, titleKey, iconName }) => {
        const showVoiceButton = name === 'index' && isOnHomeScreen;
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              tabBarLabelStyle: {
                fontSize: theme.fonts.labelSmall.fontSize,
                lineHeight: theme.fonts.labelSmall.lineHeight,
              },
              title: showVoiceButton ? '' : tRoutes(titleKey),
              tabBarAccessibilityLabel: showVoiceButton ? '' : tRoutes(titleKey),
              tabBarIcon: ({ color }) =>
                showVoiceButton ? (
                  <VoiceCommandButton style={styles.floatingButton} />
                ) : (
                  <IconSymbol name={iconName} color={color} size={StaticTheme.iconSize.l} />
                ),
            }}
          />
        );
      })}
    </Tabs>
  );
};

export default TabLayout;

const styles = StyleSheet.create({
  floatingButton: {
    justifyContent: 'flex-end',
  },
});
