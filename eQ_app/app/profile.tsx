import { Theme } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral.white,
  },
  text: {
    fontFamily: 'Rubik-Medium',
    fontSize: 24,
    color: Theme.colors.secondary[500],
  },
});
