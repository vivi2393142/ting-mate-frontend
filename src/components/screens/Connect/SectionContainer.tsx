import { type ReactNode } from 'react';

import { StaticTheme } from '@/theme';

import ThemedView from '@/components/atoms/ThemedView';
import { StyleSheet } from 'react-native';

interface SectionContainerProps {
  title: string;
  children: ReactNode;
}

const SectionContainer = ({ children }: SectionContainerProps) => {
  return <ThemedView style={styles.sectionContainer}>{children}</ThemedView>;
};

const styles = StyleSheet.create({
  sectionContainer: {
    gap: StaticTheme.spacing.xs,
    padding: 0,
  },
});

export default SectionContainer;
