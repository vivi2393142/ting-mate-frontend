import { Tabs, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';

import IconSymbol from '@/components/atoms/IconSymbol';
import VoiceCommandButton from '@/components/screens/Home/VoiceCommandButton';
import ROUTES from '@/constants/routes';

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
              title: showVoiceButton ? '' : t(titleKey),
              tabBarAccessibilityLabel: showVoiceButton ? '' : t(titleKey),
              tabBarIcon: ({ color }) =>
                showVoiceButton ? (
                  <VoiceCommandButton
                    style={styles.floatingButton}
                    onStopRecording={() => {
                      // TODO: send audio to backend
                      // const formData = new FormData();
                      // formData.append('audio', {
                      //   uri,
                      //   type: 'audio/m4a',
                      //   name: 'recording.m4a',
                      // });
                      // const response = await fetch('YOUR_BACKEND_API', {
                      //   method: 'POST',
                      //   body: formData,
                      // });
                      // const { transcript, result } = await response.json();
                      // console.log({ transcript, result });
                    }}
                  />
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
