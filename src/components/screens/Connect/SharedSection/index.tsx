import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import SectionContainer from '@/components/screens/Connect/SectionContainer';
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

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.LOG);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const tabs = [
    {
      label: t('Shared Note'),
      type: TabType.NOTE,
    },
    {
      label: t('Shared Log'),
      type: TabType.LOG,
    },
  ];

  return (
    <SectionContainer
      title={t('Shared Information')}
      isExpanded={isExpanded}
      onToggle={handleToggleExpanded}
    >
      <View style={styles.root}>
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableRipple
              key={tab.type}
              onPress={() => setActiveTab(tab.type)}
              style={[styles.tabButton, activeTab === tab.type && styles.activeTabButton]}
              rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
            >
              <Text style={[styles.tabText, activeTab === tab.type && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableRipple>
          ))}
        </View>
        {activeTab === TabType.NOTE && <SharedNoteContent isExpanded={isExpanded} />}
        {activeTab === TabType.LOG && <SharedLogContent isExpanded={isExpanded} />}
      </View>
    </SectionContainer>
  );
};

const getStyles = createStyles<
  StyleRecord<
    'root' | 'tabContainer' | 'tabButton' | 'activeTabButton',
    'tabText' | 'activeTabText'
  >
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
  tabText: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
  },
  activeTabText: {
    color: ({ colors }) => colors.onPrimary,
  },
});

export default SharedSection;
