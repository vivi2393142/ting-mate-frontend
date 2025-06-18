/* eslint-disable i18next/no-literal-string */
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Checkbox,
  Chip,
  FAB,
  IconButton,
  List,
  ProgressBar,
  RadioButton,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';

import ThemedView from '@/components/atoms/ThemedView';

// TODO: remove this screen
const ThemeTestScreen = () => {
  const theme = useAppTheme();

  return (
    <ThemedView
      isRoot
      scrollable
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineMedium" style={styles.sectionTitle}>
        Typography
      </Text>
      <View style={styles.section}>
        <Text variant="displayLarge">Display Large</Text>
        <Text variant="displayMedium">Display Medium</Text>
        <Text variant="displaySmall">Display Small</Text>
        <Text variant="headlineLarge">Headline Large</Text>
        <Text variant="headlineMedium">Headline Medium</Text>
        <Text variant="headlineSmall">Headline Small</Text>
        <Text variant="titleLarge">Title Large</Text>
        <Text variant="titleMedium">Title Medium</Text>
        <Text variant="titleSmall">Title Small</Text>
        <Text variant="bodyLarge">Body Large</Text>
        <Text variant="bodyMedium">Body Medium</Text>
        <Text variant="bodySmall">Body Small</Text>
        <Text variant="labelLarge">Label Large</Text>
        <Text variant="labelMedium">Label Medium</Text>
        <Text variant="labelSmall">Label Small</Text>
      </View>

      <Text variant="headlineMedium" style={styles.sectionTitle}>
        Buttons
      </Text>
      <View style={styles.section}>
        <Button mode="contained" onPress={() => {}} style={styles.button}>
          <Text>Contained Button</Text>
        </Button>
        <Button mode="outlined" onPress={() => {}} style={styles.button}>
          <Text>Outlined Button</Text>
        </Button>
        <Button mode="text" onPress={() => {}} style={styles.button}>
          <Text>Text Button</Text>
        </Button>
        <Button mode="contained-tonal" onPress={() => {}} style={styles.button}>
          <Text>Tonal Button</Text>
        </Button>
        <Button mode="contained" icon="camera" onPress={() => {}} style={styles.button}>
          <Text>Icon Button</Text>
        </Button>
      </View>

      <Text variant="headlineMedium" style={styles.sectionTitle}>
        Cards
      </Text>
      <View style={styles.section}>
        <Card style={styles.card}>
          <Card.Title title="Card Title" subtitle="Card Subtitle" />
          <Card.Content>
            <Text variant="bodyMedium">This is a basic card with some content.</Text>
          </Card.Content>
          <Card.Actions>
            <Button
              accessibilityLabel="Cancel action"
              accessibilityHint="Cancels the current operation"
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              accessibilityLabel="Confirm action"
              accessibilityHint="Confirms the current operation"
            >
              <Text>Ok</Text>
            </Button>
          </Card.Actions>
        </Card>
      </View>

      <Text variant="headlineMedium" style={styles.sectionTitle}>
        Inputs
      </Text>
      <View style={styles.section}>
        <TextInput
          accessibilityLabel="Text input field"
          accessibilityHint="Enter text"
          label="Text Input"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          accessibilityLabel="Text input field"
          accessibilityHint="Enter text"
          label="Text Input with Icon"
          mode="outlined"
          right={<TextInput.Icon icon="eye" />}
          style={styles.input}
        />
        <Switch value={true} onValueChange={() => {}} />
        <RadioButton.Group onValueChange={() => {}} value="first">
          <RadioButton.Item label="First item" value="first" />
          <RadioButton.Item label="Second item" value="second" />
        </RadioButton.Group>
        <Checkbox.Item label="Checkbox item" status="checked" />
      </View>

      <Text variant="headlineMedium" style={styles.sectionTitle}>
        Lists
      </Text>
      <View style={styles.section}>
        <List.Section>
          <List.Subheader>
            <Text>List Section</Text>
          </List.Subheader>
          <List.Item
            title="First Item"
            description="Item description"
            left={(props) => <List.Icon {...props} icon="folder" />}
          />
          <List.Item
            title="Second Item"
            description="Item description"
            left={(props) => <List.Icon {...props} icon="folder" />}
          />
        </List.Section>
      </View>

      <Text variant="headlineMedium" style={styles.sectionTitle}>
        Other Components
      </Text>
      <View style={styles.section}>
        <IconButton icon="camera" size={20} onPress={() => {}} />
        <FAB icon="plus" style={styles.fab} onPress={() => {}} />
        <View style={styles.chipContainer}>
          <Chip icon="information" onPress={() => {}} style={styles.chip}>
            <Text>Chip</Text>
          </Chip>
          <Chip icon="check" onPress={() => {}} style={styles.chip}>
            <Text>Selected</Text>
          </Chip>
        </View>
        <ProgressBar progress={0.5} style={styles.progressBar} />
      </View>
    </ThemedView>
  );
};

export default ThemeTestScreen;

const styles = StyleSheet.create({
  button: {
    marginVertical: 4,
  },
  card: {
    marginVertical: 8,
  },
  chip: {
    marginRight: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  container: {
    flex: 1,
  },
  fab: {
    marginVertical: 8,
  },
  input: {
    marginVertical: 8,
  },
  progressBar: {
    marginVertical: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 10,
    marginTop: 20,
    paddingHorizontal: 16,
  },
});
