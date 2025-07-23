import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedText from '@/components/atoms/ThemedText';
import SharedLogContent from '@/components/screens/Connect/SharedSection/SharedLogContent';
import SharedNoteContent from '@/components/screens/Connect/SharedSection/SharedNoteContent';

enum TabType {
  LOG = 'LOG',
  NOTE = 'NOTE',
}

const SharedSection = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { t } = useTranslation('connect');

  const [activeTab, setActiveTab] = useState<TabType>(TabType.NOTE);

  const tabs = [
    {
      label: t('Notes'),
      type: TabType.NOTE,
    },
    {
      label: t('Logs'),
      type: TabType.LOG,
    },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableRipple
            key={tab.type}
            onPress={() => setActiveTab(tab.type)}
            style={[styles.tabButton, activeTab === tab.type && styles.activeTabButton]}
            rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
          >
            <ThemedText color={activeTab === tab.type ? 'onPrimary' : 'onSurfaceVariant'}>
              {tab.label}
            </ThemedText>
          </TouchableRipple>
        ))}
      </View>
      {activeTab === TabType.NOTE && <SharedNoteContent />}
      {activeTab === TabType.LOG && <SharedLogContent />}
    </View>
  );
};

const getStyles = createStyles<
  StyleRecord<'root' | 'tabContainer' | 'tabButton' | 'activeTabButton'>
>({
  root: {
    gap: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: ({ colors }) => colors.outline,
    borderTopLeftRadius: StaticTheme.borderRadius.s,
    borderTopRightRadius: StaticTheme.borderRadius.s,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: StaticTheme.spacing.sm,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: ({ colors }) => colors.primary,
  },
});

export default SharedSection;
