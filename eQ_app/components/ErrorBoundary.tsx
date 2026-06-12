import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Theme } from '@/constants';
import { ThemedText } from '@/components/basic/ThemedText';
import logger from '@/services/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In dev this surfaces the issue; in production it's a no-op.
    logger.error('Unhandled render error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ThemedText variant="heading2" style={styles.title}>
            Something went wrong
          </ThemedText>
          <ThemedText variant="body1" style={styles.body}>
            An unexpected error occurred. Please try again or restart the app.
          </ThemedText>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <ThemedText variant="button" style={styles.buttonText}>
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.neutral.white,
    padding: 32,
    gap: 16,
  },
  title: {
    color: Theme.colors.neutral.black,
    textAlign: 'center',
  },
  body: {
    color: Theme.colors.neutral[500],
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: Theme.colors.neutral.white,
  },
});
