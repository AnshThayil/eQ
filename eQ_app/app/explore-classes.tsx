/**
 * Explore Classes Screen - View available climbing classes
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=390-1953
 */

import { Theme } from '@/constants';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components';

interface ClassCard {
  name: string;
  label?: string;
  sessions: string;
  duration?: string;
  price: string;
}

const classes: ClassCard[] = [
  {
    name: 'Climbfit',
    label: '1 month',
    sessions: '10 sessions',
    price: 'Rs. 6,000',
  },
  {
    name: 'Boulder Basics',
    sessions: '10 sessions',
    price: 'Rs. 5,000',
  },
  {
    name: 'EQ Academy',
    sessions: '10 sessions',
    duration: '1 hour 30mins',
    price: 'Rs. 9,000',
  },
  {
    name: 'Summit Squad (age 7-12)',
    sessions: '8 sessions',
    duration: '1 hour 30mins',
    price: 'Rs. 5,000',
  },
];

function BackButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      style={styles.backButton}
    >
      <ThemedText variant="button" style={{ color: Theme.colors.primary[500] }}>
        ← Back
      </ThemedText>
    </Pressable>
  );
}

function CartIcon() {
  return (
    <Pressable style={styles.cartButton}>
      <ThemedText style={{ fontSize: 24 }}>🛒</ThemedText>
    </Pressable>
  );
}

function ClassCard({ classItem }: { classItem: ClassCard }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <ThemedText variant="body2" style={styles.className}>
          {classItem.name}
        </ThemedText>
        {classItem.label && (
          <View style={styles.labelPill}>
            <ThemedText
              variant="subtext1"
              style={{ color: Theme.colors.primary[500] }}
            >
              {classItem.label}
            </ThemedText>
          </View>
        )}
        <ThemedText variant="body1" style={styles.sessionText}>
          {classItem.sessions}
        </ThemedText>
        {classItem.duration && (
          <ThemedText variant="body1" style={styles.durationText}>
            {classItem.duration}
          </ThemedText>
        )}
        <ThemedText variant="body1" style={styles.priceText}>
          {classItem.price}
        </ThemedText>
      </View>
      <Pressable style={styles.registerButton}>
        <ThemedText
          variant="button"
          style={{ color: Theme.colors.neutral.white }}
        >
          Register
        </ThemedText>
      </Pressable>
    </View>
  );
}

export default function ExploreClassesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Theme.colors.neutral.white}
      />

      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="heading1" style={styles.headerTitle}>
          Explore
        </ThemedText>
      </View>

      {/* Top Navigation */}
      <View style={styles.topNav}>
        <BackButton />
        <CartIcon />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Classes Heading */}
        <View style={styles.classesHeadingContainer}>
          <ThemedText variant="heading2" style={styles.classesHeading}>
            Classes
          </ThemedText>
        </View>

        {/* Class Cards */}
        <View style={styles.cardsList}>
          {classes.map((classItem, index) => (
            <ClassCard key={index} classItem={classItem} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  header: {
    backgroundColor: Theme.colors.neutral[100],
    paddingVertical: 20,
    paddingHorizontal: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Theme.colors.neutral[900],
    textAlign: 'center',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: 4,
  },
  cartButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  classesHeadingContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
  },
  classesHeading: {
    color: Theme.colors.neutral[900],
  },
  cardsList: {
    paddingHorizontal: 0,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[300],
  },
  cardContent: {
    flex: 1,
    gap: 7,
  },
  className: {
    color: Theme.colors.neutral[900],
  },
  labelPill: {
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  sessionText: {
    color: Theme.colors.neutral[900],
  },
  durationText: {
    color: Theme.colors.neutral[900],
  },
  priceText: {
    color: Theme.colors.neutral[900],
  },
  registerButton: {
    backgroundColor: Theme.colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
