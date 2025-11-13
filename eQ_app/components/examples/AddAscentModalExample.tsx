/**
 * Example usage of AddAscentModal component
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AddAscentModal } from '../AddAscentModal';
import { Button } from '../Button';
import { ThemedText } from '../ThemedText';

export function AddAscentModalExample() {
  const [modalVisible, setModalVisible] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{
    difficulty: string;
    isFlash: boolean;
    comments: string;
  } | null>(null);

  const handleSubmit = (data: {
    difficulty: string;
    isFlash: boolean;
    comments: string;
  }) => {
    setLastSubmission(data);
    setModalVisible(false);
    console.log('Ascent submitted:', data);
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.title}>
        AddAscentModal Example
      </ThemedText>

      <Button
        text="Log Ascent"
        onPress={() => setModalVisible(true)}
        variant="primary"
      />

      {lastSubmission && (
        <View style={styles.resultContainer}>
          <ThemedText variant="body2" style={styles.resultTitle}>
            Last Submission:
          </ThemedText>
          <ThemedText variant="body1">
            Difficulty: {lastSubmission.difficulty}
          </ThemedText>
          <ThemedText variant="body1">
            Flash: {lastSubmission.isFlash ? 'Yes' : 'No'}
          </ThemedText>
          <ThemedText variant="body1">
            Comments: {lastSubmission.comments || 'None'}
          </ThemedText>
        </View>
      )}

      <AddAscentModal
        visible={modalVisible}
        level="L3"
        colour="#FD8032"
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        difficultyOptions={['Easy', 'Medium', 'Hard']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  title: {
    marginBottom: 8,
  },
  resultContainer: {
    gap: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  resultTitle: {
    marginBottom: 4,
  },
});
