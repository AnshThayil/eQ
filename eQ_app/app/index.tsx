import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/routes" />;
}

// DESIGN SYSTEM SHOWCASE BELOW - Commented out for production
/*
import { ThemedTextExample } from "@/components/examples";
import { ActionPillExample } from "@/components/examples/ActionPillExample";
import { AscentLogExample } from "@/components/examples/AscentLogExample";
import { ButtonExample } from "@/components/examples/ButtonExample";
import { CheckboxExample } from "@/components/examples/CheckboxExample";
import { InputFieldExample } from "@/components/examples/InputFieldExample";
import { RadioButtonExample } from "@/components/examples/RadioButtonExample";
import { StaticPillExample } from "@/components/examples/StaticPillExample";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants";
import { ScrollView, StyleSheet, View } from "react-native";

export default function DesignSystemShowcase() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        <ThemedText variant="heading1">eQ App Design System</ThemedText>


        <View style={styles.section}>
          <ThemedTextExample />
        </View>

        <View style={styles.section}>
          <ButtonExample />
        </View>

        <View style={styles.section}>
          <StaticPillExample />
        </View>

        <View style={styles.section}>
          <ActionPillExample />
        </View>

        <View style={styles.section}>
          <InputFieldExample />
        </View>

        <View style={styles.section}>
          <RadioButtonExample />
        </View>

        <View style={styles.section}>
          <CheckboxExample />
        </View>

        <View style={styles.section}>
          <AscentLogExample />
        </View>

        <View style={styles.section}>
          <ThemedText variant="heading2" style={styles.sectionTitle}>
            Color Palette
          </ThemedText>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: Colors.primary[500] }]} />
            <ThemedText variant="body3">Primary</ThemedText>
          </View>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: Colors.secondary[500] }]} />
            <ThemedText variant="body3">Secondary</ThemedText>
          </View>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: Colors.success[500] }]} />
            <ThemedText variant="body3">Success</ThemedText>
          </View>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: Colors.warning[500] }]} />
            <ThemedText variant="body3">Warning</ThemedText>
          </View>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: Colors.error[500] }]} />
            <ThemedText variant="body3">Error</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  title: {
    color: Colors.primary[500],
    marginTop: 40,
  },
  description: {
    color: Colors.neutral[700],
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
});
*/
