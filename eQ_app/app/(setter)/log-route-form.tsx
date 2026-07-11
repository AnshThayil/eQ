/**
 * Log Route Form Screen (setter-facing)
 * Form to add a single new route to a zone.
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=471-6922
 */

import { Button, ChevronLeftIcon, ThemedText } from '@/components';
import { CaretDownIcon, HoldIcon } from '@/components/icons';
import { InputField } from '@/components/basic/InputField';
import { Theme } from '@/constants';
import { createBoulder, getStaffUsers, StaffUser } from '@/services/api';
import { getErrorMessage } from '@/services/errors';
import logger from '@/services/logger';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const GRADES = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STYLES = ['Technical', 'Power', 'Slab', 'Coordination', 'Electric'];

// Colour options with display name + hex value for the HoldIcon
const COLOURS: { label: string; hex: string }[] = [
  { label: 'Red', hex: '#E53935' },
  { label: 'Crimson', hex: '#B71C1C' },
  { label: 'Pink', hex: '#E91E8C' },
  { label: 'Rose', hex: '#F48FB1' },
  { label: 'Orange', hex: '#FB8C00' },
  { label: 'Peach', hex: '#FFAB76' },
  { label: 'Yellow', hex: '#FDD835' },
  { label: 'Gold', hex: '#F9A825' },
  { label: 'Lime', hex: '#C6E03B' },
  { label: 'Green', hex: '#43A047' },
  { label: 'Forest', hex: '#1B5E20' },
  { label: 'Teal', hex: '#00897B' },
  { label: 'Cyan', hex: '#00ACC1' },
  { label: 'Sky Blue', hex: '#29B6F6' },
  { label: 'Blue', hex: '#1E88E5' },
  { label: 'Navy', hex: '#1A237E' },
  { label: 'Purple', hex: '#8E24AA' },
  { label: 'Violet', hex: '#5E35B1' },
  { label: 'Lavender', hex: '#B39DDB' },
  { label: 'Brown', hex: '#6D4C41' },
  { label: 'Tan', hex: '#A1887F' },
  { label: 'Grey', hex: '#757575' },
  { label: 'Silver', hex: '#BDBDBD' },
  { label: 'White', hex: '#F5F5F5' },
  { label: 'Black', hex: '#212121' },
];

// ─── Colour Picker Field ──────────────────────────────────────────────────────

interface ColourPickerFieldProps {
  label: string;
  value: string;      // hex
  valueLabel: string; // display name
  onSelect: (hex: string, label: string) => void;
}

function ColourPickerField({ label, value, valueLabel, onSelect }: ColourPickerFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={cpStyles.container}>
      <ThemedText variant="subtext2" style={cpStyles.label}>{label}</ThemedText>
      <TouchableOpacity
        style={cpStyles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {value ? (
          <HoldIcon size={22} color={value} />
        ) : (
          <View style={cpStyles.placeholder} />
        )}
        <ThemedText variant="body1" style={[cpStyles.triggerText, !value && cpStyles.placeholderText]}>
          {valueLabel || 'Select'}
        </ThemedText>
        <CaretDownIcon size={24} color={Theme.colors.neutral[900]} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={cpStyles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={cpStyles.sheet} onPress={(e) => e.stopPropagation()}>
            <ThemedText variant="heading2" style={cpStyles.sheetTitle}>Hold Colour</ThemedText>
            <FlatList
              data={COLOURS}
              keyExtractor={(c) => c.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={cpStyles.option}
                  onPress={() => { onSelect(item.hex, item.label); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <HoldIcon size={24} color={item.hex} />
                  <ThemedText variant="body1" style={cpStyles.optionLabel}>{item.label}</ThemedText>
                  {item.hex === value && (
                    <View style={cpStyles.checkDot} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const cpStyles = StyleSheet.create({
  container: { gap: 4 },
  label: { color: Theme.colors.neutral[900] },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[500],
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Theme.colors.neutral.white,
  },
  triggerText: { flex: 1, color: Theme.colors.neutral[900] },
  placeholder: { width: 22, height: 22 },
  placeholderText: { color: Theme.colors.neutral[700] },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: '75%',
    paddingVertical: 8,
    ...Theme.shadow.lg,
  },
  sheetTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[300],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  optionLabel: { flex: 1, color: Theme.colors.neutral[900] },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary[500],
  },
});

export default function LogRouteFormScreen() {
  const router = useRouter();
  const { zoneId, zoneName } = useLocalSearchParams<{ zoneId: string; zoneName: string }>();
  const wallId = zoneId ? parseInt(zoneId, 10) : undefined;

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  const [colour, setColour] = useState(''); // hex
  const [colourLabel, setColourLabel] = useState('');
  const [grade, setGrade] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [climbingStyle, setClimbingStyle] = useState('');
  const [setter, setSetter] = useState('');
  const [tester, setTester] = useState('');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStaffUsers()
      .then((users) => setStaffUsers(users))
      .catch((err) => logger.error('[LogRouteForm] failed to load staff', err))
      .finally(() => setLoadingStaff(false));
  }, []);

  const staffNames = staffUsers.map((u) => u.name);

  const handleSave = useCallback(async () => {
    if (!wallId) return;
    if (!colourLabel || !grade) {
      Alert.alert('Required Fields', 'Please select a hold colour and grade.');
      return;
    }
    setSaving(true);
    try {
      const setterUser = staffUsers.find((u) => u.name === setter);
      const testerUser = staffUsers.find((u) => u.name === tester);
      await createBoulder({
        wall: wallId,
        color: colour,
        setter_grade: grade,
        difficulty: difficulty.toLowerCase() || undefined,
        climbing_style: climbingStyle.toLowerCase() || undefined,
        setter: setterUser?.id,
      });
      // tester is not part of createBoulder payload directly — pass it if backend expands
      router.back();
    } catch (err) {
      logger.error('[LogRouteForm] save failed', err);
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [wallId, colour, grade, difficulty, climbingStyle, setter, tester, staffUsers, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="heading1">Log Routes</ThemedText>
      </View>

      {/* Back + section title */}
      <View style={styles.subHeaderContainer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeftIcon size={12} color={Theme.colors.primary[500]} />
          <ThemedText variant="button" style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>
        <ThemedText variant="heading2" style={styles.sectionTitle}>Route Info</ThemedText>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          {/* Row 1 – Colour + Style */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ColourPickerField
                label="Hold Colour"
                value={colour}
                valueLabel={colourLabel}
                onSelect={(hex, lbl) => { setColour(hex); setColourLabel(lbl); }}
              />
            </View>
            <View style={styles.halfField}>
              <InputField
                type="dropdown"
                label="Style"
                value={climbingStyle}
                placeholder="Select"
                options={STYLES}
                onSelectOption={setClimbingStyle}
                rightIcon={<CaretDownIcon size={24} color={Theme.colors.neutral[900]} />}
                fullWidth
              />
            </View>
          </View>

          {/* Row 2 – Grade + Difficulty */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <InputField
                type="dropdown"
                label="Grade"
                value={grade}
                placeholder="Select"
                options={GRADES}
                onSelectOption={setGrade}
                rightIcon={<CaretDownIcon size={24} color={Theme.colors.neutral[900]} />}
                fullWidth
              />
            </View>
            <View style={styles.halfField}>
              <InputField
                type="dropdown"
                label="Difficulty"
                value={difficulty}
                placeholder="Select"
                options={DIFFICULTIES}
                onSelectOption={setDifficulty}
                rightIcon={<CaretDownIcon size={24} color={Theme.colors.neutral[900]} />}
                fullWidth
              />
            </View>
          </View>

          {/* Setter */}
          {loadingStaff ? (
            <ActivityIndicator color={Theme.colors.primary[500]} />
          ) : (
            <InputField
              type="dropdown"
              label="Setter"
              value={setter}
              placeholder="Select setter"
              options={staffNames}
              onSelectOption={setSetter}
              rightIcon={<CaretDownIcon size={24} color={Theme.colors.neutral[900]} />}
              fullWidth
            />
          )}

          {/* Tester */}
          {!loadingStaff && (
            <InputField
              type="dropdown"
              label="Tester"
              value={tester}
              placeholder="Select tester"
              options={staffNames}
              onSelectOption={setTester}
              rightIcon={<CaretDownIcon size={24} color={Theme.colors.neutral[900]} />}
              fullWidth
            />
          )}

          {/* Comments */}
          <View style={styles.commentsContainer}>
            <ThemedText variant="subtext2" style={styles.commentsLabel}>Comments</ThemedText>
            <TextInput
              style={styles.commentsInput}
              value={comments}
              onChangeText={setComments}
              placeholder="Enter"
              placeholderTextColor={Theme.colors.neutral[700]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              text={saving ? 'Saving…' : 'Save'}
              onPress={handleSave}
              disabled={saving}
            />
            <Button
              text="Cancel"
              variant="secondary"
              onPress={() => router.back()}
              disabled={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 72,
    backgroundColor: Theme.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  subHeaderContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 16,
  },
  backText: {
    color: Theme.colors.primary[500],
  },
  sectionTitle: {
    color: Theme.colors.neutral[900],
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
    minWidth: 0,
  },
  commentsContainer: {
    gap: 4,
  },
  commentsLabel: {
    color: Theme.colors.neutral[900],
    marginBottom: 4,
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: Theme.colors.neutral[500],
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    color: Theme.colors.neutral[900],
    fontFamily: 'Rubik_300Light',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    justifyContent: 'flex-start',
  },
});
