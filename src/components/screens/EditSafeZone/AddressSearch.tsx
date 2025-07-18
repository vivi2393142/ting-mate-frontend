import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Keyboard, ScrollView, View } from 'react-native';
import { Divider, TextInput, TouchableRipple } from 'react-native-paper';

import { usePlaceSearch } from '@/api/places';
import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import type { AddressData } from '@/types/connect';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import Skeleton from '@/components/atoms/Skeleton';
import ThemedText from '@/components/atoms/ThemedText';

interface AddressOptionProps {
  option: AddressData;
  onPress: (option: AddressData) => void;
}

const AddressOption = ({ option, onPress }: AddressOptionProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <TouchableRipple
      onPress={() => onPress(option)}
      style={styles.optionItem}
      rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
    >
      <View style={styles.optionContent}>
        <ThemedText
          variant="bodyMedium"
          style={styles.optionName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {option.name}
        </ThemedText>
        <ThemedText
          variant="bodySmall"
          color="onSurfaceVariant"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {option.address}
        </ThemedText>
      </View>
    </TouchableRipple>
  );
};

// Add enum for right icon type
export enum RightIconType {
  MAGNIFY = 'magnify',
  CLOSE = 'close',
}

// Enum for AddressSearchBar state
export enum SearchBarState {
  IDLE = 'IDLE',
  SELECTED = 'SELECTED',
  SELECTED_EDITING = 'SELECTED_EDITING',
  SEARCHING = 'SEARCHING',
  RESULTS = 'RESULTS',
  RESULTS_EDITING = 'RESULTS_EDITING',
}

interface AddressSearchProps {
  selectedAddress: AddressData | null;
  onAddressSelect: (address: AddressData | null) => void;
}

const AddressSearch = ({ selectedAddress, onAddressSelect }: AddressSearchProps) => {
  const { t } = useTranslation('connect');
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const [userInput, setUserInput] = useState(selectedAddress?.name || '');
  const [options, setOptions] = useState<AddressData[]>();
  const [searchBarState, setSearchBarState] = useState<SearchBarState>(
    selectedAddress ? SearchBarState.SELECTED : SearchBarState.IDLE,
  );

  const placeSearchMutation = usePlaceSearch();

  // Update state on input change
  const handleInputChange = useCallback(
    (value: string) => {
      setUserInput(value);
      if (searchBarState === SearchBarState.SEARCHING) return;
      if (searchBarState === SearchBarState.SELECTED) {
        setSearchBarState(SearchBarState.SELECTED_EDITING);
      } else if (options) {
        setSearchBarState(SearchBarState.RESULTS_EDITING);
      } else {
        setSearchBarState(SearchBarState.IDLE);
      }
    },
    [searchBarState, options],
  );

  // Search handler
  const handleSearch = useCallback(async () => {
    Keyboard.dismiss();
    if (!userInput.trim()) return;

    setSearchBarState(SearchBarState.SEARCHING);
    placeSearchMutation.mutate(
      { query: userInput },
      {
        onSuccess: (data) => {
          setOptions(data);
        },
        onError: () => {
          setOptions([]);
        },
        onSettled: () => {
          setSearchBarState(SearchBarState.RESULTS);
        },
      },
    );
  }, [userInput, placeSearchMutation]);

  // Option select handler
  const handleOptionSelect = useCallback(
    (option: AddressData) => {
      onAddressSelect(option);
      setUserInput(option.name);
      setOptions(undefined);
      setSearchBarState(SearchBarState.SELECTED);
    },
    [onAddressSelect],
  );

  // Clear handler
  const handleClearSelection = useCallback(() => {
    onAddressSelect(null);
    setOptions(undefined);
  }, [onAddressSelect]);

  // Icon logic
  const rightIconType = useMemo(() => {
    switch (searchBarState) {
      case SearchBarState.SEARCHING:
      case SearchBarState.IDLE:
      case SearchBarState.SELECTED_EDITING:
      case SearchBarState.RESULTS_EDITING:
        return RightIconType.MAGNIFY;
      case SearchBarState.SELECTED:
      case SearchBarState.RESULTS:
        return RightIconType.CLOSE;
      default:
        return RightIconType.MAGNIFY;
    }
  }, [searchBarState]);

  const handleRightIconPress = useCallback(() => {
    switch (rightIconType) {
      case RightIconType.MAGNIFY:
        handleSearch();
        break;
      case RightIconType.CLOSE:
        handleClearSelection();
        break;
    }
  }, [handleClearSelection, handleSearch, rightIconType]);

  // Sync userInput and searchBarState with selectedAddress
  useEffect(() => {
    if (!selectedAddress) {
      setUserInput('');
      setSearchBarState(SearchBarState.IDLE);
    } else {
      setUserInput(selectedAddress.name);
      setSearchBarState(SearchBarState.SELECTED);
    }
  }, [selectedAddress]);

  // Render options only in RESULTS/RESULTS_EDITING
  const showOptions =
    searchBarState === SearchBarState.SEARCHING ||
    ((searchBarState === SearchBarState.RESULTS ||
      searchBarState === SearchBarState.RESULTS_EDITING) &&
      options);

  return (
    <View>
      <FormInput
        label={t('Location')}
        icon="location"
        placeholder={t('Search for address')}
        value={userInput}
        onChangeValue={handleInputChange}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        contentStyle={styles.contentInput}
        readOnly={searchBarState === SearchBarState.SEARCHING}
        right={
          <TextInput.Icon
            icon={rightIconType}
            onPress={handleRightIconPress}
            color={(isTextInputFocused) =>
              isTextInputFocused ? theme.colors.primary : theme.colors.outline
            }
            size={StaticTheme.iconSize.m}
            style={styles.icon}
            disabled={searchBarState === SearchBarState.SEARCHING}
          />
        }
      />
      {searchBarState === SearchBarState.SEARCHING && (
        <Skeleton width={'100%'} height={40} style={styles.resultsContainer} />
      )}
      {(searchBarState === SearchBarState.RESULTS ||
        searchBarState === SearchBarState.RESULTS_EDITING) &&
        options &&
        (options.length ? (
          <View style={[styles.resultsContainer, styles.optionsContainer]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {options.map((option) => (
                <AddressOption
                  key={`${option.latitude}-${option.longitude}`}
                  option={option}
                  onPress={handleOptionSelect}
                />
              ))}
            </ScrollView>
          </View>
        ) : (
          <ThemedText variant="bodyMedium" color="onSurfaceVariant" style={styles.noResults}>
            {t('No results found')}
          </ThemedText>
        ))}
      {showOptions && <Divider style={styles.divider} />}
    </View>
  );
};

const getStyles = createStyles<
  StyleRecord<
    'icon' | 'resultsContainer' | 'optionsContainer' | 'optionItem' | 'optionContent' | 'divider',
    'contentInput' | 'optionName' | 'noResults'
  >
>({
  contentInput: {
    marginRight: 28,
  },
  icon: {
    width: StaticTheme.iconSize.xl,
    height: StaticTheme.iconSize.xl,
    marginRight: -22,
  },
  resultsContainer: {
    marginTop: StaticTheme.spacing.md,
  },
  noResults: {
    marginTop: StaticTheme.spacing.md,
    paddingLeft: StaticTheme.spacing.md,
  },
  optionsContainer: {
    borderWidth: 1,
    borderRadius: StaticTheme.borderRadius.s,
    borderColor: ({ colors }) => colors.outline,
    backgroundColor: ({ colors }) => colors.surface,
    maxHeight: 200,
  },
  optionItem: {
    borderBottomWidth: 1,
    borderColor: ({ colors }) => colors.outlineVariant,
  },
  optionContent: {
    paddingHorizontal: StaticTheme.spacing.md,
    paddingVertical: StaticTheme.spacing.sm,
  },
  optionName: {
    marginBottom: StaticTheme.spacing.xs,
  },
  divider: {
    marginTop: StaticTheme.spacing.md,
  },
});

export default AddressSearch;
