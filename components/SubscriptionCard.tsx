import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Shield, Zap, CheckCircle } from 'lucide-react-native';
import { Colors, Shadows, BorderRadius, Spacing, Typography } from '@/constants/DesignTokens';
import { useAds } from '@/hooks/useAds';
import { PurchasesPackage } from 'react-native-purchases';

interface SubscriptionCardProps {
  onPurchaseSuccess?: () => void;
}

export default function SubscriptionCard({ onPurchaseSuccess }: SubscriptionCardProps) {
  const { isPremium, showAds, purchasePremium, isLoading } = useAds();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [purchasing, setPurchasing] = useState(false);

  // Load available packages
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const { revenueCatService } = await import('@/lib/revenueCatService');
        const availablePackages = await revenueCatService.getAvailablePackages();
        setPackages(availablePackages);
      } catch (error) {
        console.error('Error loading packages:', error);
      }
    };

    if (!isPremium) {
      loadPackages();
    }
  }, [isPremium]);

  // If user is premium, don't show the card
  if (isPremium) {
    return null;
  }

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setPurchasing(true);
      const success = await purchasePremium(pkg);
      
      if (success) {
        Alert.alert('Success!', 'Thank you for upgrading to Premium! Ads have been removed.');
        onPurchaseSuccess?.();
      } else {
        Alert.alert('Purchase Failed', 'There was an issue with your purchase. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'An error occurred during purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const getBestPackage = () => {
    if (packages.length === 0) return null;
    
    // Sort by price (lowest first) and return the first one
    return packages.sort((a, b) => a.product.price - b.product.price)[0];
  };

  const bestPackage = getBestPackage();

  const benefits = [
    { icon: Shield, text: 'Remove all banner ads' },
    { icon: Zap, text: 'No more interstitial ads' },
    { icon: Crown, text: 'Skip reward ads' },
    { icon: CheckCircle, text: 'Full app experience' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.crownContainer}>
            <Crown size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Go Premium</Text>
          <Text style={styles.subtitle}>Remove Ads Forever</Text>
        </View>

        <View style={styles.benefits}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <benefit.icon size={18} color="#FFFFFF" />
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>

        {bestPackage && (
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => handlePurchase(bestPackage)}
            disabled={purchasing || isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F0F0F0']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    {bestPackage.product.priceString}
                  </Text>
                  <Text style={styles.buttonSubtext}>
                    {bestPackage.packageType === 'ANNUAL' ? 'per year' : 'per month'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>
          One-time purchase • Cancel anytime
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['2xl'],
  },
  card: {
    borderRadius: BorderRadius['3xl'],
    padding: Spacing['3xl'],
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  crownContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.weights.medium,
  },
  benefits: {
    marginBottom: Spacing['2xl'],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  benefitText: {
    fontSize: Typography.sizes.sm,
    color: '#FFFFFF',
    marginLeft: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
  purchaseButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  buttonGradient: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: '#8B5CF6',
    textAlign: 'center',
  },
  buttonSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    marginTop: 2,
  },
  footerText: {
    fontSize: Typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
});