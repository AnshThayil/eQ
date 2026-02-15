/**
 * Example usage of the InputField component
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CaretDownIcon, EmailIcon, LocationPinIcon, SearchIcon } from '../../icons';
import { InputField } from '../../basic/InputField';
import { ThemedText } from '../../basic/ThemedText';

export function InputFieldExample() {
  const [textValue, setTextValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.heading}>
        Input Fields
      </ThemedText>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Text Inputs
        </ThemedText>

        <InputField
          type="text"
          label="Email Address"
          placeholder="Email"
          value={emailValue}
          onChangeText={setEmailValue}
          leftIcon={<EmailIcon color={Theme.colors.secondary[500]} />}
          keyboardType="email-address"
        />

        <InputField
          type="text"
          label="Search"
          placeholder="Search"
          value={searchValue}
          onChangeText={setSearchValue}
          leftIcon={<SearchIcon color={Theme.colors.secondary[500]} />}
        />

        <InputField
          type="text"
          placeholder="Simple text input"
          value={textValue}
          onChangeText={setTextValue}
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Dropdowns
        </ThemedText>

        <InputField
          type="dropdown"
          label="Location"
          placeholder="Placeholder"
          value={selectedLocation}
          leftIcon={<LocationPinIcon color={Theme.colors.secondary[500]} />}
          rightIcon={<CaretDownIcon color={Theme.colors.neutral[900]} />}
          options={[
            'San Francisco, CA',
            'New York, NY',
            'Los Angeles, CA',
            'Chicago, IL',
            'Austin, TX',
          ]}
          onSelectOption={setSelectedLocation}
        />

        <InputField
          type="dropdown"
          placeholder="Choose an option"
          value={selectedOption}
          rightIcon={<CaretDownIcon color={Theme.colors.neutral[900]} />}
          options={['Option 1', 'Option 2', 'Option 3', 'Option 4']}
          onSelectOption={setSelectedOption}
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          States
        </ThemedText>

        <InputField
          type="text"
          label="Disabled Input"
          placeholder="This is disabled"
          value=""
          disabled
        />

        <InputField
          type="text"
          label="Error State"
          placeholder="Invalid input"
          value="wrong@"
          error
          leftIcon={<EmailIcon color={Theme.colors.error[500]} />}
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Without Icons
        </ThemedText>

        <InputField
          type="text"
          label="Name"
          placeholder="Enter your name"
          value=""
          onChangeText={() => {}}
        />

        <InputField
          type="dropdown"
          label="Category"
          placeholder="Select category"
          options={['Work', 'Personal', 'Shopping', 'Travel', 'Other']}
          onSelectOption={() => {}}
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Full Width
        </ThemedText>

        <InputField
          type="text"
          label="Full Width Input"
          placeholder="This input takes full width"
          value=""
          onChangeText={() => {}}
          fullWidth
        />

        <InputField
          type="dropdown"
          label="Full Width Dropdown"
          placeholder="Select an option"
          options={['Option A', 'Option B', 'Option C']}
          onSelectOption={() => {}}
          rightIcon={<CaretDownIcon color={Theme.colors.neutral[900]} />}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.lg,
  },
  heading: {
    marginBottom: Theme.spacing.sm,
  },
  section: {
    gap: Theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.xs,
  },
});
