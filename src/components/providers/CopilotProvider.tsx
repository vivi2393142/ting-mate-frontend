import { StaticTheme } from '@/theme';
import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  CopilotProvider as RCCopilotProvider,
  useCopilot,
  type CopilotProps,
  type TooltipProps,
} from 'react-native-copilot';
import { Button, Text } from 'react-native-paper';

import colors from '@/theme/colors.json';
import fonts from '@/theme/fonts';

const CustomStepNumber = () => {
  const { currentStepNumber } = useCopilot();

  return (
    <View style={styles.stepNumberContainer}>
      <Text style={styles.stepNumberText}>{currentStepNumber}</Text>
    </View>
  );
};

export const Tooltip = ({ labels }: TooltipProps) => {
  const { goToNext, goToPrev, stop, currentStep, isFirstStep, isLastStep } = useCopilot();

  return (
    <View>
      <View style={styles.tooltipContainer}>
        <Text style={styles.tooltipText}>{currentStep?.text}</Text>
      </View>
      <View style={styles.buttonsRow}>
        {!isLastStep && (
          <TouchableOpacity onPress={stop}>
            <Button style={styles.button} labelStyle={styles.buttonLabel}>
              {labels.skip}
            </Button>
          </TouchableOpacity>
        )}
        {!isFirstStep && (
          <TouchableOpacity onPress={goToPrev}>
            <Button style={styles.button} labelStyle={styles.buttonLabel}>
              {labels.previous}
            </Button>
          </TouchableOpacity>
        )}
        {!isLastStep ? (
          <TouchableOpacity onPress={goToNext}>
            <Button style={styles.button} labelStyle={styles.buttonLabel}>
              {labels.next}
            </Button>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={stop}>
            <Button style={styles.button} labelStyle={styles.buttonLabel}>
              {labels.finish}
            </Button>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface CopilotProviderProps extends CopilotProps {
  children: ReactNode;
}

const CopilotProvider = ({ children, ...rest }: CopilotProviderProps) => {
  return (
    <RCCopilotProvider tooltipComponent={Tooltip} stepNumberComponent={CustomStepNumber} {...rest}>
      {children}
    </RCCopilotProvider>
  );
};

const styles = StyleSheet.create({
  button: {
    borderColor: colors.coreColors.primary,
    borderRadius: StaticTheme.borderRadius.s,
    borderWidth: 1,
  },
  buttonLabel: {
    color: colors.coreColors.primary,
    marginVertical: StaticTheme.spacing.xs * 1.5,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm * 1.5,
    justifyContent: 'flex-end',
    marginVertical: StaticTheme.spacing.sm * 1.5,
  },
  stepNumberContainer: {
    alignItems: 'center',
    backgroundColor: colors.coreColors.primary,
    borderColor: colors.coreColors.neutral,
    borderRadius: StaticTheme.borderRadius.round,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  stepNumberText: {
    color: colors.palettes.primary['100'],
    fontWeight: 'bold',
  },
  tooltipContainer: {
    paddingHorizontal: StaticTheme.spacing.xs,
    paddingVertical: StaticTheme.spacing.xs,
  },
  tooltipText: {
    ...fonts.STANDARD.bodyLarge,
  },
});

export default CopilotProvider;
