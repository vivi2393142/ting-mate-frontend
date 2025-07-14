import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Keyboard, ScrollView, Text, View } from 'react-native';
import { Divider, TextInput, TouchableRipple } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import type { AddressData } from '@/types/connect';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import Skeleton from '@/components/atoms/Skeleton';

// TODO: Get options from google api
const mockOptions: AddressData[] = [
  {
    name: 'Chang Gung Memorial Hospital Taipei Branch',
    address: 'No. 199, Dunhua N Rd, Songshan District, Taipei City, Taiwan',
    latitude: 25.0585,
    longitude: 121.5443,
  },
  {
    name: 'Chang Gung Clinic Minsheng Branch',
    address: 'No. 109, Sec 3, Minsheng E Rd, Zhongshan District, Taipei City, Taiwan',
    latitude: 25.0602,
    longitude: 121.5337,
  },
  {
    name: 'Chang Gung Clinic Songshan Branch',
    address: 'Fuxing N Rd, Songshan District, Taipei City, Taiwan',
    latitude: 25.0514,
    longitude: 121.5512,
  },
  {
    name: 'Chang Gung Clinic Songshan Branch',
    address: 'Fuxing N Rd, Songshan District, Taipei City, Taiwan',
    latitude: 25.051,
    longitude: 121.5512,
  },
  {
    name: 'Chang Gung Clinic Songshan Branch',
    address: 'Fuxing N Rd, Songshan District, Taipei City, Taiwan',
    latitude: 25.0511,
    longitude: 121.5512,
  },
  {
    name: 'Chang Gung Clinic Songshan Branch',
    address: 'Fuxing N Rd, Songshan District, Taipei City, Taiwan',
    latitude: 25.0512,
    longitude: 121.5512,
  },
];

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
        <Text style={styles.optionName} numberOfLines={1} ellipsizeMode="tail">
          {option.name}
        </Text>
        <Text style={styles.optionAddress} numberOfLines={1} ellipsizeMode="tail">
          {option.address}
        </Text>
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
  const handleSearch = useCallback(() => {
    if (!userInput.trim()) return;
    setSearchBarState(SearchBarState.SEARCHING);
    Keyboard.dismiss();
    setTimeout(() => {
      setOptions(mockOptions);
      setSearchBarState(SearchBarState.RESULTS);
    }, 1000);
  }, [userInput]);

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
          <Text style={styles.noResults}>{t('No results found')}</Text>
        ))}
      {showOptions && <Divider style={styles.divider} />}
    </View>
  );
};

const getStyles = createStyles<
  StyleRecord<
    'icon' | 'resultsContainer' | 'optionsContainer' | 'optionItem' | 'optionContent' | 'divider',
    'contentInput' | 'optionName' | 'optionAddress' | 'noResults'
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
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
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
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onSurface,
    marginBottom: StaticTheme.spacing.xs,
  },
  optionAddress: {
    fontSize: ({ fonts }) => fonts.bodySmall.fontSize,
    fontWeight: ({ fonts }) => fonts.bodySmall.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodySmall.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
  },
  divider: {
    marginTop: StaticTheme.spacing.md,
  },
});

export default AddressSearch;
