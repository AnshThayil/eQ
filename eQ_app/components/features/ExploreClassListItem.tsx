import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ActionPill } from '../basic/ActionPill';
import { Button } from '../basic/Button';
import { ThemedText } from '../basic/ThemedText';
import { CaretDownIcon } from '../icons';

export interface ExploreClassListItemProps {
  title: string;
  sessionsText: string;
  priceText: string;
  buttonText?: string;
  dropdownPillLabel?: string;
  onActionPress: () => void;
  onDropdownPillPress?: () => void;
  actionDisabled?: boolean;
  style?: ViewStyle;
}

export function ExploreClassListItem({
  title,
  sessionsText,
  priceText,
  buttonText = 'Register',
  dropdownPillLabel,
  onActionPress,
  onDropdownPillPress,
  actionDisabled = false,
  style,
}: ExploreClassListItemProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <ThemedText variant="body2" style={styles.title}>
          {title}
        </ThemedText>

        {dropdownPillLabel ? (
          <ActionPill
            text={dropdownPillLabel}
            size="small"
            onPress={onDropdownPillPress ?? (() => {})}
            icon={<CaretDownIcon size={16} color={Theme.colors.primary[500]} />}
            accessibilityHint={`Open options for ${title}`}
          />
        ) : null}

        <ThemedText variant="body1" style={styles.metaText}>
          {sessionsText}
        </ThemedText>

        <ThemedText variant="body1" style={styles.metaText}>
          {priceText}
        </ThemedText>
      </View>

      <View style={styles.buttonSlot}>
        <Button
          text={buttonText}
          onPress={onActionPress}
          fullWidth
          disabled={actionDisabled}
          accessibilityHint={`Perform ${buttonText.toLowerCase()} for ${title}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Theme.semantic.border.default,
    backgroundColor: Theme.colors.neutral.white,
    gap: Theme.spacing.md,
  },
  content: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  title: {
    color: Theme.semantic.text.primary,
    marginBottom: 7,
  },
  metaText: {
    color: Theme.semantic.text.primary,
    marginTop: 7,
  },
  buttonSlot: {
    width: 104,
    paddingTop: Theme.spacing.xs,
    flexShrink: 0,
  },
});