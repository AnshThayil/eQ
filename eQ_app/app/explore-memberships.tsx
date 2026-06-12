import { Button, ExploreClassListItem, ThemedText } from '@/components';
import RazorpayWebViewModal from '@/components/features/RazorpayWebViewModal';
import { CartIcon } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import { Theme } from '@/constants';
import {
  ExploreClassGroup,
  ExploreClassVariation,
  getExploreMemberships,
} from '@/services/api';
import logger from '@/services/logger';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

function formatAccessSummary(variation: ExploreClassVariation) {
  const parts: string[] = [];

  if (variation.access_type === 'sessions' && variation.num_sessions) {
    parts.push(`${variation.num_sessions} sessions`);
  } else if (variation.access_type === 'unlimited') {
    parts.push('Unlimited access');
  } else if (variation.access_type === 'single_day') {
    parts.push('Single day access');
  }

  if (variation.duration_days) {
    parts.push(`${variation.duration_days} day${variation.duration_days === 1 ? '' : 's'}`);
  }

  return parts.join(' • ') || 'Contact for details';
}

function formatPrice(price: string) {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return `Rs. ${price}`;
  }

  const hasDecimals = !Number.isInteger(numericPrice);
  return `Rs. ${numericPrice.toLocaleString('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  })}`;
}

export default function ExploreMembershipsScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { initiatePayment, isProcessing, modalVisible, orderData, currentItemName, handleSuccess, handleFailure, handleDismiss } = useRazorpay();

  const [membershipGroups, setMembershipGroups] = useState<ExploreClassGroup[]>([]);
  const [selectedVariationByGroup, setSelectedVariationByGroup] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    let isMounted = true;

    const loadMemberships = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getExploreMemberships();
        if (!isMounted) {
          return;
        }

        const nextGroups = response.memberships.filter((group) => group.variations.length > 0);
        setMembershipGroups(nextGroups);
        setSelectedVariationByGroup(
          nextGroups.reduce<Record<number, number>>((accumulator, group) => {
            accumulator[group.id] = group.variations[0].id;
            return accumulator;
          }, {})
        );
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        logger.error('Failed to load membership groups:', fetchError);
        setError('Unable to load memberships right now.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMemberships();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated]);

  const handleRefresh = async () => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const response = await getExploreMemberships();
      const nextGroups = response.memberships.filter((group) => group.variations.length > 0);
      setMembershipGroups(nextGroups);
      setSelectedVariationByGroup(
        nextGroups.reduce<Record<number, number>>((accumulator, group) => {
          accumulator[group.id] = group.variations[0].id;
          return accumulator;
        }, {})
      );
    } catch (fetchError) {
      console.error('Failed to refresh membership groups:', fetchError);
      setError('Unable to load memberships right now.');
    } finally {
      setRefreshing(false);
    }
  };

  const activeGroup = useMemo(
    () => membershipGroups.find((group) => group.id === activeGroupId) ?? null,
    [activeGroupId, membershipGroups]
  );

  const handleSelectVariation = (groupId: number, variationId: number) => {
    setSelectedVariationByGroup((currentState) => ({
      ...currentState,
      [groupId]: variationId,
    }));
    setActiveGroupId(null);
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <View style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral.white} />
        <SafeAreaView style={styles.authContainer}>
          <ThemedText variant="body1" style={styles.authText}>
            Please log in to view memberships
          </ThemedText>
          <Button
            text="Go to Login"
            onPress={() => router.push('/login')}
            variant="primary"
            style={styles.authButton}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral[100]} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <ThemedText variant="heading1" style={styles.headerTitle}>
            Explore
          </ThemedText>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <Pressable style={styles.backButton} onPress={() => router.replace('/explore')}>
              <ThemedText variant="body2" style={styles.backText}>
                {'<'} Back
              </ThemedText>
            </Pressable>

            <Pressable style={styles.inlineCartButton} accessibilityRole="button" disabled>
              <CartIcon size={24} color={Theme.colors.primary[500]} />
            </Pressable>
          </View>

          <ThemedText variant="heading2" style={styles.sectionTitle}>
            Memberships
          </ThemedText>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              (loading || error || membershipGroups.length === 0) && styles.scrollContentState,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Theme.colors.primary[500]}
              />
            }
          >
            {loading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
                <ThemedText variant="body1" style={styles.stateText}>
                  Loading memberships...
                </ThemedText>
              </View>
            ) : error ? (
              <View style={styles.stateContainer}>
                <ThemedText variant="body1" style={styles.stateText}>
                  {error}
                </ThemedText>
              </View>
            ) : membershipGroups.length === 0 ? (
              <View style={styles.stateContainer}>
                <ThemedText variant="body1" style={styles.stateText}>
                  No memberships are available right now.
                </ThemedText>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {membershipGroups.map((group) => {
                  const selectedVariationId = selectedVariationByGroup[group.id] ?? group.variations[0]?.id;
                  const selectedVariation =
                    group.variations.find((variation) => variation.id === selectedVariationId) ?? group.variations[0];
                  const hasMultipleOptions = group.variations.length > 1;

                  return (
                    <ExploreClassListItem
                      key={group.id}
                      title={group.name}
                      dropdownPillLabel={hasMultipleOptions ? selectedVariation.name : undefined}
                      sessionsText={formatAccessSummary(selectedVariation)}
                      priceText={formatPrice(selectedVariation.price)}
                      onActionPress={() => initiatePayment(selectedVariation.id, selectedVariation.name)}
                      actionDisabled={isProcessing}
                      onDropdownPillPress={hasMultipleOptions ? () => setActiveGroupId(group.id) : undefined}
                    />
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>

        <RazorpayWebViewModal
          visible={modalVisible}
          orderData={orderData}
          itemName={currentItemName}
          onSuccess={handleSuccess}
          onFailure={handleFailure}
          onDismiss={handleDismiss}
        />

        <Modal
        visible={activeGroup !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveGroupId(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setActiveGroupId(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <ThemedText variant="body2" style={styles.modalTitle}>
              {activeGroup?.name}
            </ThemedText>

            {activeGroup?.variations.map((variation) => {
              const isSelected = selectedVariationByGroup[activeGroup.id] === variation.id;

              return (
                <Pressable
                  key={variation.id}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                  onPress={() => handleSelectVariation(activeGroup.id, variation.id)}
                >
                  <View style={styles.modalOptionCopy}>
                    <ThemedText variant="body1" style={styles.modalOptionLabel}>
                      {variation.name}
                    </ThemedText>
                    <ThemedText variant="subtext2" style={styles.modalOptionMeta}>
                      {formatAccessSummary(variation)}
                    </ThemedText>
                  </View>
                  <ThemedText variant="body1" style={styles.modalOptionPrice}>
                    {formatPrice(variation.price)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral.white,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },
  authText: {
    color: Theme.colors.neutral[700],
    textAlign: 'center',
  },
  authButton: {
    marginTop: Theme.spacing.md,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  header: {
    height: 72,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 20,
    backgroundColor: Theme.colors.neutral[100],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSide: {
    width: 24,
  },
  headerTitle: {
    color: Theme.semantic.text.primary,
    textAlign: 'center',
  },
  topRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: Theme.colors.primary[500],
  },
  inlineCartButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: Theme.semantic.text.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
  },
  scrollContentState: {
    flexGrow: 1,
  },
  listContainer: {
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  stateText: {
    color: Theme.colors.neutral[700],
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    ...Theme.shadow.md,
  },
  modalTitle: {
    color: Theme.semantic.text.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  modalOptionSelected: {
    backgroundColor: Theme.colors.neutral[100],
  },
  modalOptionCopy: {
    flex: 1,
    gap: Theme.spacing.xs,
  },
  modalOptionLabel: {
    color: Theme.semantic.text.primary,
  },
  modalOptionMeta: {
    color: Theme.colors.neutral[700],
  },
  modalOptionPrice: {
    color: Theme.semantic.text.primary,
  },
});